import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/panel");

  return <div className="min-h-screen bg-bg text-ink">{children}</div>;
}
