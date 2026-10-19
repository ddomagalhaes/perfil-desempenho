import Link from "next/link";

export function AppTopBar() {
  return (
    <div className="app-topbar">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">Perfil de Desempenho</span>
      </Link>
      <Link href="/" className="home-link">
        ← Início
      </Link>
    </div>
  );
}
