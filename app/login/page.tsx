import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="login-page">
      <div className="login-card">
        <p className="home-eyebrow login-eyebrow">Perfil de Desempenho</p>
        <h1>Entrar</h1>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
