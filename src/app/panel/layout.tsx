import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.role !== "ambassador" || user.status !== "active" || !user.university_id) {
    redirect("/login");
  }

  return <div className="min-h-screen bg-bg text-ink">{children}</div>;
}
