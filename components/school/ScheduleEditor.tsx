"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonContent } from "@/components/school/ScheduleGrid";
import {
  continuesPrevious,
  formatRange,
  WEEKDAY_LABELS,
  weekdaysFor,
  type SlotDTO,
} from "@/lib/school/schedule";

type EditingCell = { slot: SlotDTO; weekday: number };

export function ScheduleEditor({
  studentId,
  slots,
  includeSaturday,
}: {
  studentId: string;
  slots: SlotDTO[];
  includeSaturday: boolean;
}) {
  const days = weekdaysFor(includeSaturday);
  const [editing, setEditing] = useState<EditingCell | null>(null);

  const subjects = [
    ...new Set(slots.flatMap((s) => Object.values(s.lessons).map((l) => l.subject))),
  ].sort((a, b) => a.localeCompare(b, "pt"));

  if (slots.length === 0) {
    return (
      <p className="empty">
        Ainda sem blocos horários. Define-os no painel “Blocos horários” ou copia o horário de um
        colega.
      </p>
    );
  }

  return (
    <>
      <table className="sched">
        <thead>
          <tr>
            <th className="time">Hora</th>
            {days.map((d) => (
              <th key={d}>{WEEKDAY_LABELS[d]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, i) =>
            slot.kind === "BREAK" ? (
              <tr key={slot.id} className="break">
                <td className="time">{formatRange(slot.startMin, slot.endMin)}</td>
                <td className="label" colSpan={days.length}>
                  {slot.label || "Intervalo"}
                </td>
              </tr>
            ) : (
              <tr key={slot.id}>
                <td className="time">{formatRange(slot.startMin, slot.endMin)}</td>
                {days.map((d) => {
                  const lesson = slot.lessons[d];
                  const classes = ["cell", "editable"];
                  if (lesson) classes.push("lesson");
                  if (continuesPrevious(slots, i, d)) classes.push("cont");
                  return (
                    <td
                      key={d}
                      className={classes.join(" ")}
                      onClick={() => setEditing({ slot, weekday: d })}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setEditing({ slot, weekday: d });
                        }
                      }}
                      title={`${WEEKDAY_LABELS[d]} ${formatRange(slot.startMin, slot.endMin)}`}
                    >
                      {lesson ? <LessonContent lesson={lesson} /> : <span className="add">+</span>}
                    </td>
                  );
                })}
              </tr>
            )
          )}
        </tbody>
      </table>
      <p className="hint">
        Clica numa célula para preencher ou alterar. Aulas iguais em blocos seguidos (ex.: 90 min)
        aparecem juntas no PDF.
      </p>

      <datalist id="subject-suggestions">
        {subjects.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {editing && (
        <LessonDialog
          key={`${editing.slot.id}-${editing.weekday}`}
          studentId={studentId}
          cell={editing}
          nextSlot={nextLessonSlot(slots, editing.slot)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function nextLessonSlot(slots: SlotDTO[], slot: SlotDTO): SlotDTO | null {
  const idx = slots.findIndex((s) => s.id === slot.id);
  const next = slots[idx + 1];
  return next && next.kind === "LESSON" ? next : null;
}

function LessonDialog({
  studentId,
  cell,
  nextSlot,
  onClose,
}: {
  studentId: string;
  cell: EditingCell;
  nextSlot: SlotDTO | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const current = cell.slot.lessons[cell.weekday];
  const [subject, setSubject] = useState(current?.subject ?? "");
  const [room, setRoom] = useState(current?.room ?? "");
  const [teacher, setTeacher] = useState(current?.teacher ?? "");
  const [alsoNext, setAlsoNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    subjectRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save(values: { subject: string; room: string; teacher: string }) {
    setSaving(true);
    setError(null);
    try {
      const repeat = alsoNext && nextSlot && values.subject.trim();
      const targets = [cell.slot.id, ...(repeat ? [nextSlot.id] : [])];
      for (const slotId of targets) {
        const res = await fetch(`/api/students/${studentId}/lessons`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId, weekday: cell.weekday, ...values }),
        });
        if (!res.ok) throw new Error();
      }
      router.refresh();
      onClose();
    } catch {
      setError("Não foi possível guardar. Tenta outra vez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          save({ subject, room, teacher });
        }}
      >
        <h3>
          {WEEKDAY_LABELS[cell.weekday]} · {formatRange(cell.slot.startMin, cell.slot.endMin)}
        </h3>
        <p className="hint">Deixa a disciplina vazia para não haver aula neste bloco.</p>

        <label className="field" htmlFor="lesson-subject">
          Disciplina
        </label>
        <input
          ref={subjectRef}
          id="lesson-subject"
          type="text"
          list="subject-suggestions"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Matemática"
          autoComplete="off"
        />
        <label className="field" htmlFor="lesson-room">
          Sala (opcional)
        </label>
        <input
          id="lesson-room"
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="S12"
        />
        <label className="field" htmlFor="lesson-teacher">
          Professor (opcional)
        </label>
        <input
          id="lesson-teacher"
          type="text"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          placeholder="Prof.ª Ana Costa"
        />

        {nextSlot && subject.trim() && (
          <label className="check">
            <input type="checkbox" checked={alsoNext} onChange={(e) => setAlsoNext(e.target.checked)} />
            Repetir no bloco seguinte ({formatRange(nextSlot.startMin, nextSlot.endMin)})
          </label>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="row" style={{ marginTop: 16 }}>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? "A guardar…" : "Guardar"}
          </button>
          {current && (
            <button
              type="button"
              className="danger-outline"
              disabled={saving}
              onClick={() => save({ subject: "", room: "", teacher: "" })}
            >
              Limpar
            </button>
          )}
          <button type="button" onClick={onClose} disabled={saving} style={{ marginLeft: "auto" }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
