import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getReportStats } from "@/lib/informes";
import { InformeImpreso } from "@/components/informes/InformeImpreso";
import { PrintButton } from "@/components/informes/PrintButton";

export const metadata: Metadata = { title: "Informe PDF", robots: { index: false } };

export default async function PanelInformePdfPage() {
  const user = await getSessionUser();
  if (!user?.university_id) redirect("/login");

  const supabase = await createClient();
  const [{ stats }, uniRes] = await Promise.all([
    getReportStats(user.university_id),
    supabase.from("universities").select("name").eq("id", user.university_id).single(),
  ]);

  return (
    <div className="rounded-2xl bg-white p-2 sm:p-4">
      <div className="mb-3 flex justify-end px-4 pt-2 print:hidden">
        <PrintButton />
      </div>
      <InformeImpreso
        titulo={uniRes.data?.name ?? "Universidad"}
        subtitulo="Impacto de la plataforma en la comunidad de la universidad"
        stats={stats}
      />
    </div>
  );
}
