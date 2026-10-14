import {
  computeRowSpans,
  formatRange,
  WEEKDAY_LABELS,
  weekdaysFor,
  type LessonDTO,
  type SlotDTO,
} from "@/lib/school/schedule";

export function LessonContent({ lesson }: { lesson: LessonDTO }) {
  const meta = [lesson.room, lesson.teacher].filter(Boolean).join(" · ");
  return (
    <>
      <span className="subj">{lesson.subject}</span>
      {meta && <span className="meta">{meta}</span>}
    </>
  );
}

/** Grelha só de leitura (impressão): aulas iguais em blocos seguidos juntam-se
 * numa só célula com rowSpan. */
export function ScheduleGrid({
  slots,
  includeSaturday,
}: {
  slots: SlotDTO[];
  includeSaturday: boolean;
}) {
  const days = weekdaysFor(includeSaturday);
  if (slots.length === 0) {
    return <p className="empty">Sem blocos horários definidos.</p>;
  }

  const spansByDay = Object.fromEntries(days.map((d) => [d, computeRowSpans(slots, d)]));

  return (
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
                const span = spansByDay[d][i];
                if (span === 0) return null;
                const lesson = slot.lessons[d];
                return (
                  <td key={d} rowSpan={span} className={lesson ? "cell lesson" : "cell"}>
                    {lesson && <LessonContent lesson={lesson} />}
                  </td>
                );
              })}
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}
