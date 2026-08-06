import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getReportStats, getReportByUniversity } from "@/lib/informes";
import { InformeImpreso } from "@/components/informes/InformeImpreso";
import { PrintButton } from "@/components/informes/PrintButton";
import { fmtNum } from "@/components/informes/ReportBits";

export const metadata: Metadata = { title: "Informe ejecutivo PDF", robots: { index: false } };

export default async function AdminInformePdfPage() {
  const supabase = await createClient();
  const [{ stats }, porUni, uniRes] = await Promise.all([
    getReportStats(null),
    getReportByUniversity(),
    supabase.from("universities").select("id, name, short_name, status").is("deleted_at", null),
  ]);

  const unis = (uniRes.data ?? []) as {
    id: string;
    name: string;
    short_name: string | null;
    status: string;
  }[];
  const uniName = new Map(unis.map((u) => [u.id, u.short_name || u.name]));
  const activas = unis.filter((u) => u.status === "active").length;

  const ranking = porUni
    .filter((r) => uniName.has(r.university_id))
    .map((r) => ({ ...r, nombre: uniName.get(r.university_id) ?? "—" }))
    .slice(0, 8);

  return (
    <div className="rounded-2xl bg-white p-2 sm:p-4">
      <div className="mb-3 flex justify-end px-4 pt-2 print:hidden">
        <PrintButton />
      </div>
      <InformeImpreso
        titulo="Informe nacional"
        subtitulo={`Red presente en ${activas} universidad${activas === 1 ? "" : "es"} de la Argentina`}
        stats={stats}
        extra={
          ranking.length > 0 ? (
            <section className="mt-7">
              <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
                Actividad por universidad
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 text-left font-mono text-[0.6rem] uppercase tracking-[0.12em] text-neutral-500">
                    <th className="py-1.5 pr-2 font-medium">Universidad</th>
                    <th className="py-1.5 pr-2 text-right font-medium">Estudiantes</th>
                    <th className="py-1.5 pr-2 text-right font-medium">Visitas</th>
                    <th className="py-1.5 text-right font-medium">Interacciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r) => (
                    <tr key={r.university_id} className="border-b border-neutral-100">
                      <td className="py-1.5 pr-2 text-neutral-800">{r.nombre}</td>
                      <td className="py-1.5 pr-2 text-right font-mono text-neutral-700">{fmtNum(r.estudiantes)}</td>
                      <td className="py-1.5 pr-2 text-right font-mono text-neutral-700">{fmtNum(r.visitas)}</td>
                      <td className="py-1.5 text-right font-mono text-neutral-700">{fmtNum(r.interacciones)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : undefined
        }
      />
    </div>
  );
}
