import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "./PanelNav";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.role !== "ambassador" || user.status !== "active" || !user.university_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: uni } = await supabase
    .from("universities")
    .select("name")
    .eq("id", user.university_id)
    .single();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-hair">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-blue-300">
              Panel del embajador
            </p>
            <p className="mt-0.5 font-display text-lg font-bold tracking-tight">
              {uni?.name ?? "Tu universidad"}
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost text-xs">
              Cerrar sesión
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-4xl px-6">
          <PanelNav />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
