export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
