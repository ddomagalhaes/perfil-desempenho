import type { CadenceSummary, KpiProfile, ProspectProfile as ProspectProfileData } from "@/lib/data/scoutingEvaluations";
import { Sparkline } from "./Sparkline";

function ScoreCard({ label, summary }: { label: string; summary: CadenceSummary }) {
  return (
    <div className="profile-score-card">
      <p className="profile-score-label">{label}</p>
      {summary.average === null ? (
        <p className="empty">Sem avaliações ainda.</p>
      ) : (
        <>
          <div className="profile-score-value">
            {summary.average.toFixed(1)}
            {summary.banda && <span className="kpi-score-banda"> · {summary.banda.label}</span>}
          </div>
          <Sparkline values={summary.trend.map((p) => p.value)} max={10} width={220} height={48} />
          <p className="profile-score-meta">
            {summary.n} {summary.n === 1 ? "avaliação" : "avaliações"}
            {summary.consistencia && ` · ${summary.consistencia}`}
            {summary.n < 3 && " · amostra pequena, interpreta com cautela"}
          </p>
        </>
      )}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: KpiProfile }) {
  return (
    <div className="legend-card profile-kpi-card">
      <div className="profile-kpi-head">
        <h3>{kpi.name}</h3>
        {kpi.average !== null && (
          <span className="profile-kpi-value">
            {kpi.average.toFixed(1)}
            {kpi.banda && <span className="kpi-score-banda"> · {kpi.banda.label}</span>}
          </span>
        )}
      </div>
      {kpi.n === 0 ? (
        <p className="empty">Sem avaliações ainda.</p>
      ) : (
        <>
          <Sparkline values={kpi.trend.map((p) => p.value)} max={10} />
          <p className="hint">
            {kpi.n} {kpi.n === 1 ? "avaliação" : "avaliações"}
            {kpi.peerN > 0 && kpi.peerAverage !== null && (
              <> · média dos prospetos na posição: {kpi.peerAverage.toFixed(1)} (n={kpi.peerN})</>
            )}
          </p>
        </>
      )}
    </div>
  );
}

export function ProspectProfile({ profile }: { profile: ProspectProfileData }) {
  const comKpis = profile.kpis.filter((k) => k.n > 0);
  const ordenados = [...comKpis].sort((a, b) => (b.average ?? 0) - (a.average ?? 0));
  const pontosFortes = ordenados.slice(0, 3);
  const aDesenvolver = ordenados.length > 3 ? [...ordenados].reverse().slice(0, 3) : [];

  return (
    <div className="profile">
      <div className="profile-score-row">
        <ScoreCard label="Score ponderado — por jogo" summary={profile.porJogo} />
        <ScoreCard label="Score ponderado — periódica" summary={profile.periodica} />
      </div>

      {comKpis.length === 0 ? (
        <p className="empty">
          Ainda sem avaliações gravadas para este prospeto — o perfil preenche-se à medida que fores
          avaliando.
        </p>
      ) : (
        <>
          {pontosFortes.length > 0 && (
            <div>
              <h2>Pontos fortes</h2>
              <div className="legend-list">
                {pontosFortes.map((k) => (
                  <KpiCard key={k.kpiId} kpi={k} />
                ))}
              </div>
            </div>
          )}

          {aDesenvolver.length > 0 && (
            <div>
              <h2>A desenvolver</h2>
              <div className="legend-list">
                {aDesenvolver.map((k) => (
                  <KpiCard key={k.kpiId} kpi={k} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2>Todas as competências</h2>
            {profile.position && (
              <p className="hint">
                Comparação com {profile.peerCount} outro{profile.peerCount === 1 ? "" : "s"} prospeto
                {profile.peerCount === 1 ? "" : "s"} na posição &ldquo;{profile.position.name}&rdquo; — não
                é uma comparação com a liga nem com outros clubes.
              </p>
            )}
            <div className="legend-list">
              {profile.kpis.map((k) => (
                <KpiCard key={k.kpiId} kpi={k} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
