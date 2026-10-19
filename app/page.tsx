import Link from "next/link";
import { getOverviewStats } from "@/lib/data/overview";

export const dynamic = "force-dynamic";

type Section = {
  href: string;
  title: string;
  description: string;
  stat: string | null;
  links: { href: string; label: string }[];
  icon: React.ReactNode;
};

const iconProps = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ICONS = {
  psychological: (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17" opacity="0.45" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  technical: (
    <svg {...iconProps} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M12 5v14" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M3 9.5h2.8v5H3M21 9.5h-2.8v5H21" />
    </svg>
  ),
  scouting: (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5.5 5.5" />
      <path d="M8 10.5h5M10.5 8v5" opacity="0.5" />
    </svg>
  ),
  school: (
    <svg {...iconProps} aria-hidden="true">
      <path d="M3 8.5L12 4l9 4.5-9 4.5-9-4.5z" />
      <path d="M7 11v4.5c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5V11" />
      <path d="M21 8.5V14" />
    </svg>
  ),
};

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default async function Home() {
  const stats = await getOverviewStats();

  const sections: Section[] = [
    {
      href: "/psychological/teams",
      title: "Psicológico",
      description: "Perfil psicológico de cada atleta numa roda de competências, por equipa.",
      stat: stats && plural(stats.athletes, "atleta", "atletas"),
      links: [
        { href: "/psychological/teams", label: "Equipas" },
        { href: "/psychological/competencies", label: "Competências" },
        { href: "/psychological/compare", label: "Comparar" },
      ],
      icon: ICONS.psychological,
    },
    {
      href: "/technical/teams",
      title: "Técnico/Tático",
      description: "Competências técnicas e táticas por posição, com leitura por equipa.",
      stat: stats && plural(stats.teams, "equipa", "equipas"),
      links: [
        { href: "/technical/teams", label: "Equipas" },
        { href: "/technical/competencies", label: "Posições" },
        { href: "/technical/compare", label: "Comparar" },
      ],
      icon: ICONS.technical,
    },
    {
      href: "/scouting/prospects",
      title: "Scouting",
      description: "Prospetos em observação, avaliação psicológica por jogo e periódica.",
      stat: stats && plural(stats.prospects, "prospeto", "prospetos"),
      links: [
        { href: "/scouting/prospects", label: "Prospetos" },
        { href: "/scouting/kpis", label: "KPIs" },
        { href: "/scouting/compare", label: "Comparar" },
      ],
      icon: ICONS.scouting,
    },
    {
      href: "/school/groups/pousada",
      title: "Escolar",
      description: "Horários escolares dos alunos-atletas, por grupo.",
      stat: stats && plural(stats.students, "aluno", "alunos"),
      links: [
        { href: "/school/groups/pousada", label: "Pousada" },
        { href: "/school/groups/uaare", label: "UAARE" },
      ],
      icon: ICONS.school,
    },
  ];

  return (
    <main className="home">
      <section className="home-hero">
        <p className="home-eyebrow">Departamento de Formação</p>
        <h1>Perfil de Desempenho</h1>
        <p className="home-lead">
          Um só sítio para acompanhar o perfil psicológico, técnico/tático, o scouting e a vida
          escolar dos atletas.
        </p>
        {stats && (
          <dl className="home-stats">
            <div>
              <dt>Atletas</dt>
              <dd>{stats.athletes}</dd>
            </div>
            <div>
              <dt>Equipas</dt>
              <dd>{stats.teams}</dd>
            </div>
            <div>
              <dt>Prospetos</dt>
              <dd>{stats.prospects}</dd>
            </div>
            <div>
              <dt>Avaliações de scouting</dt>
              <dd>{stats.evaluations}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="home-grid" aria-label="Áreas da aplicação">
        {sections.map((s) => (
          <article className="home-card" key={s.title}>
            <div className="home-card-icon">{s.icon}</div>
            <h2>
              <Link href={s.href}>{s.title}</Link>
            </h2>
            <p className="home-card-desc">{s.description}</p>
            {s.stat && <p className="home-card-stat">{s.stat}</p>}
            <div className="home-card-links">
              {s.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
