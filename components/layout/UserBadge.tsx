import { logout } from "@/lib/auth-actions";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Mostra quem tem sessão iniciada (antes era só um nome gravado no browser,
 * sem login nenhum) e um botão para sair. */
export function UserBadge({ userName }: { userName: string | null }) {
  return (
    <form action={logout} className="topbar-user">
      <span className="topbar-user-initials">{userName ? initials(userName) : "?"}</span>
      <span className="topbar-user-name">{userName ?? "—"}</span>
      <button type="submit" className="topbar-user-logout">
        Sair
      </button>
    </form>
  );
}
