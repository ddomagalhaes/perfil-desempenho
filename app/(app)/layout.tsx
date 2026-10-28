import { AppTopBar } from "@/components/layout/AppTopBar";
import { NavBar } from "@/components/layout/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppTopBar />
      <div className="wrap">
        <NavBar />
        {children}
      </div>
    </>
  );
}
