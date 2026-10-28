export function AreaHero({
  label,
  title,
  subtitle,
  statValue,
  statLabel,
  actions,
}: {
  label: string;
  title: string;
  subtitle: string;
  statValue: string | number;
  statLabel: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="area-hero">
      <div>
        <p className="area-hero-label">{label}</p>
        <h1 className="area-hero-title">{title}</h1>
        <p className="area-hero-subtitle">{subtitle}</p>
        {actions && <div className="area-hero-actions">{actions}</div>}
      </div>
      <div className="area-hero-stat">
        <span className="area-hero-stat-value">{statValue}</span>
        <span className="area-hero-stat-label">{statLabel}</span>
      </div>
    </div>
  );
}
