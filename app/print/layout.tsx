export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="wrap print-page">{children}</div>;
}
