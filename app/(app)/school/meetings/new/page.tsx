import Link from "next/link";
import { listGroupSchedules } from "@/lib/data/students";
import { PageHeader } from "@/components/layout/PageHeader";
import { MeetingForm, type RosterEntry } from "@/components/school/MeetingForm";
import {
  GROUP_BY_SLUG,
  GROUP_LABELS,
  isGroupSlug,
  scheduleHint,
  studentClassLabel,
  type GroupSlug,
} from "@/lib/school/schedule";

export const dynamic = "force-dynamic";

export default async function NewMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group: slugParam } = await searchParams;
  const slug: GroupSlug = slugParam && isGroupSlug(slugParam) ? slugParam : "pousada";
  const group = GROUP_BY_SLUG[slug];
  const schedules = await listGroupSchedules(group);

  const roster: RosterEntry[] = schedules.map((s) => ({
    id: s.id,
    name: s.name,
    classLabel: studentClassLabel(s),
    scheduleHint: scheduleHint(s.slots),
  }));

  return (
    <>
      <nav className="breadcrumbs">
        <Link href="/school/meetings">← Reuniões escolares</Link>
      </nav>
      <PageHeader
        title="Nova reunião"
        subtitle="Escreve a nota de cada aluno que participou; os restantes ficam em branco."
        actions={
          <div className="seg">
            <Link href="/school/meetings/new?group=pousada" className={slug === "pousada" ? "active" : ""}>
              {GROUP_LABELS.POUSADA}
            </Link>
            <Link href="/school/meetings/new?group=uaare" className={slug === "uaare" ? "active" : ""}>
              {GROUP_LABELS.UAARE}
            </Link>
          </div>
        }
      />
      <MeetingForm key={group} mode="create" group={group} roster={roster} />
    </>
  );
}
