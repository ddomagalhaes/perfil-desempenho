type MetaItem = { label: string; value: string };

/** Cabeçalho partilhado por todas as rotas /print/* — antes cada página
 * inventava o seu próprio <h1>/<p>, sem identidade visual nenhuma. "Gerado
 * em" é sempre calculado aqui, nunca passado por quem chama, para a data
 * nunca ficar desencontrada da hora real de impressão. */
export function PrintHeader({
  eyebrow,
  title,
  subtitle,
  meta = [],
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: MetaItem[];
}) {
  const geradoEm = new Date();
  const allMeta: MetaItem[] = [
    ...meta,
    {
      label: "Gerado em",
      value: `${geradoEm.toLocaleDateString("pt-PT")} ${geradoEm.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    },
  ];

  return (
    <header className="print-header">
      <div className="print-header-band">
        <span className="print-header-brand">Perfil de Desempenho</span>
        <span className="print-header-eyebrow">{eyebrow}</span>
      </div>
      <div className="print-header-main">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="print-header-subtitle">{subtitle}</p>}
        </div>
        <dl className="print-header-meta">
          {allMeta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
