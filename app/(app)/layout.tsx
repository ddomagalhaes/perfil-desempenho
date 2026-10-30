import { auth } from "@/auth";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { NavBar } from "@/components/layout/NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <>
      <AppTopBar userName={session?.user?.name ?? null} />
      <div className="wrap">
        <NavBar />
        {children}
      </div>
    </>
  );
}
