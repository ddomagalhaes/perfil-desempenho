"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SaveStatus, type SaveState } from "@/components/layout/SaveStatus";
import type { SchoolGroup } from "@/app/generated/prisma/enums";
import type { SchoolMeetingDetailDTO } from "@/lib/school/meetings";

export type RosterEntry = {
  id: string;
  name: string;
  school: string;
  classLabel: string;
  scheduleHint: string;
};

/** Agrupa o roster por escola (ordem alfabética), para ser mais fácil
 * encontrar os alunos de uma escola em concreto ao escrever as notas. */
function groupBySchool(roster: RosterEntry[]): { school: string; students: RosterEntry[] }[] {
  const bySchool = new Map<string, RosterEntry[]>();
  for (const s of roster) {
    const key = s.school || "Sem escola definida";
    if (!bySchool.has(key)) bySchool.set(key, []);
    bySchool.get(key)!.push(s);
  }
  return [...bySchool.keys()]
    .sort((a, b) => a.localeCompare(b, "pt"))
    .map((school) => ({
      school,
      students: bySchool.get(school)!.sort((a, b) => a.name.localeCompare(b.name, "pt")),
    }));
}

type Props =
  | { mode: "create"; group: SchoolGroup; roster: RosterEntry[] }
  | {
      mode: "edit";
      group: SchoolGroup;
      roster: RosterEntry[];
      meeting: SchoolMeetingDetailDTO;
      initialNotes: Record<string, string>;
    };

type Draft = {
  date: string;
  school: string;
  withWhom: string;
  generalNote: string;
  notes: Record<string, string>;
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readDraft(key: string): Partial<Draft> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<Draft>) : null;
  } catch {
    return null;
  }
}

/** Ecrã único de criar/editar uma reunião escolar: metadados + nota por aluno
 * do grupo, guardados tudo de uma vez. Mantém um rascunho em localStorage
 * (chave por reunião, ou por grupo enquanto ainda não existe) para não perder
 * o que foi escrito se a página fechar antes de guardar. As páginas que usam
 * este componente passam `key={meeting.id}`/`key={group}` para garantir um
 * estado (e uma leitura do rascunho) novos a cada reunião. */
export function MeetingForm(props: Props) {
  const router = useRouter();
  const { roster, group } = props;
  const meetingId = props.mode === "edit" ? props.meeting.id : undefined;
  const draftKey = meetingId ? `school-meeting-draft:${meetingId}` : `school-meeting-draft:new:${group}`;

  const [form, setForm] = useState<Draft>(() => {
    const base: Draft = {
      date: props.mode === "edit" ? props.meeting.date : todayISO(),
      school: props.mode === "edit" ? props.meeting.school : "",
      withWhom: props.mode === "edit" ? props.meeting.withWhom : "",
      generalNote: props.mode === "edit" ? props.meeting.note : "",
      notes: props.mode === "edit" ? props.initialNotes : {},
    };
    const draft = readDraft(draftKey);
    if (!draft) return base;
    return {
      date: typeof draft.date === "string" ? draft.date : base.date,
      school: typeof draft.school === "string" ? draft.school : base.school,
      withWhom: typeof draft.withWhom === "string" ? draft.withWhom : base.withWhom,
      generalNote: typeof draft.generalNote === "string" ? draft.generalNote : base.generalNote,
      notes:
        draft.notes && typeof draft.notes === "object" ? { ...base.notes, ...draft.notes } : base.notes,
    };
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const hydratedRef = useRef(false);

  useEffect(() => {
    // A primeira passagem já reflete o rascunho (lido no estado inicial);
    // só grava a partir da primeira alteração feita pelo utilizador.
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
    } catch {
      // localStorage indisponível (ex.: janela privada) — segue sem rascunho.
    }
  }, [draftKey, form]);

  function clearDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaveState("idle");
  }

  function updateNote(studentId: string, value: string) {
    setForm((f) => ({ ...f, notes: { ...f.notes, [studentId]: value } }));
    setSaveState("idle");
  }

  const rosterIds = new Set(roster.map((s) => s.id));
  const filledCount = roster.filter((s) => (form.notes[s.id] ?? "").trim()).length;
  const bySchool = groupBySchool(roster);

  async function handleSave() {
    setSaveState("saving");
    const studentNotes = Object.entries(form.notes)
      .filter(([studentId]) => rosterIds.has(studentId))
      .map(([studentId, note]) => ({ studentId, note }));

    try {
      const res = await fetch(meetingId ? `/api/school-meetings/${meetingId}` : "/api/school-meetings", {
        method: meetingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          group,
          school: form.school,
          withWhom: form.withWhom,
          note: form.generalNote,
          studentNotes,
        }),
      });
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      setSaveState("saved");
      clearDraft();
      if (meetingId) {
        router.refresh();
      } else {
        const created: SchoolMeetingDetailDTO = await res.json();
        router.push(`/school/meetings/${created.id}`);
      }
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="layout">
      <div>
        <div className="panel">
          <h2>Detalhes da reunião</h2>
          <label className="field" htmlFor="meeting-date">
            Data
          </label>
          <input id="meeting-date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />

          <label className="field" htmlFor="meeting-school" style={{ marginTop: 10 }}>
            Escola
          </label>
          <input
            id="meeting-school"
            type="text"
            value={form.school}
            onChange={(e) => set("school", e.target.value)}
            placeholder="Escola Secundária…"
          />

          <label className="field" htmlFor="meeting-whom" style={{ marginTop: 10 }}>
            Com quem reuni (opcional)
          </label>
          <input
            id="meeting-whom"
            type="text"
            value={form.withWhom}
            onChange={(e) => set("withWhom", e.target.value)}
            placeholder="Diretor de turma, psicóloga escolar…"
          />

          <label className="field" htmlFor="meeting-note" style={{ marginTop: 10 }}>
            Nota geral (opcional)
          </label>
          <textarea
            id="meeting-note"
            value={form.generalNote}
            onChange={(e) => set("generalNote", e.target.value)}
            rows={3}
            placeholder="Observações gerais da reunião…"
          />
        </div>
      </div>

      <div className="panel">
        <h2>
          Alunos ({filledCount}/{roster.length} com nota)
        </h2>
        {roster.length === 0 && <p className="empty">Sem alunos ativos neste grupo.</p>}
        {roster.length > 0 && (
          <div className="meeting-roster">
            {bySchool.map(({ school, students }) => (
              <div className="meeting-roster-school-group" key={school}>
                <h3 className="meeting-roster-school-heading">{school}</h3>
                {students.map((s) => (
                  <div className="meeting-roster-row" key={s.id}>
                    <div className="meeting-roster-row-info">
                      <strong>{s.name}</strong>
                      <span className="meeting-roster-row-meta">
                        {[s.classLabel, s.scheduleHint].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={form.notes[s.id] ?? ""}
                      onChange={(e) => updateNote(s.id, e.target.value)}
                      placeholder="Sem nota"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="row" style={{ alignItems: "center", marginTop: 14 }}>
          <button type="button" className="primary" onClick={handleSave} disabled={saveState === "saving"}>
            Guardar reunião
          </button>
          <SaveStatus state={saveState} />
        </div>
      </div>
    </div>
  );
}
