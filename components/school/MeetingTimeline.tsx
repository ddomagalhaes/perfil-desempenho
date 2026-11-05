import Link from "next/link";
import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ExpandableRowGroup } from "@/components/ui/ExpandableRowGroup";
import { formatMeetingDate, type StudentMeetingTimelineEntryDTO } from "@/lib/school/meetings";

/** Linha do tempo de notas de reuniões escolares de um aluno, da mais recente
 * para a mais antiga. Dados confidenciais: só aparece aqui, nunca em
 * exportações/PDFs (ver app/print/school). */
export function MeetingTimeline({ entries }: { entries: StudentMeetingTimelineEntryDTO[] }) {
  if (entries.length === 0) {
    return <p className="empty">Ainda sem notas de reuniões escolares para este aluno.</p>;
  }

  return (
    <ExpandableRowGroup>
      {entries.map((entry) => (
        <ExpandableRow
          key={entry.meetingId}
          id={entry.meetingId}
          closed={
            <div className="athlete-row-closed">
              <div className="athlete-row-name">
                <strong>{formatMeetingDate(entry.date)}</strong>
                <span className="athlete-row-meta">{entry.school || "Escola não indicada"}</span>
              </div>
            </div>
          }
          open={
            <div className="athlete-open">
              <p style={{ whiteSpace: "pre-wrap" }}>{entry.note}</p>
              <div className="athlete-open-actions">
                <Link href={`/school/meetings/${entry.meetingId}`}>Ver reunião</Link>
              </div>
            </div>
          }
        />
      ))}
    </ExpandableRowGroup>
  );
}
