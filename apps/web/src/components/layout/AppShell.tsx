import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
  activeItem: string;
};

export function AppShell({ children, activeItem }: AppShellProps) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <Sidebar activeItem={activeItem} />
        {children}
      </div>
    </main>
  );
}
