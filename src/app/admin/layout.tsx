import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/panel");

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-hair">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-blue-300">
              Administración
            </p>
            <p className="mt-0.5 truncate font-display text-base font-bold tracking-tight sm:text-lg">
              Cursemos Ingeniería
            </p>
            <p className="mt-0.5 truncate font-mono text-[0.62rem] text-ink-mute">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post" className="shrink-0">
            <button type="submit" className="btn btn-ghost text-xs">
              Salir
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
