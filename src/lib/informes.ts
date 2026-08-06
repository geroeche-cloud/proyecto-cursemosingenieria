// SOLO SERVIDOR: createAdminClient ya se niega a correr en el navegador.
import { createAdminClient } from "@/lib/supabase/admin";
import { logIfError } from "@/lib/log";
import { STATS_VACIAS, type Stats } from "@/components/informes/ReportBits";

/**
 * Lee todos los números de un informe en UNA llamada a la base
 * (función report_stats de la migración 0010). Solo servidor.
 */
export async function getReportStats(universityId: string | null): Promise<{
  stats: Stats;
  listo: boolean; // false si la migración 0010 todavía no corrió
}> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("report_stats", { p_uni: universityId });
  if (error) {
    logIfError("report_stats", error);
    return { stats: STATS_VACIAS, listo: false };
  }
  return { stats: { ...STATS_VACIAS, ...(data as Partial<Stats>) }, listo: true };
}

export type UniReportRow = {
  university_id: string;
  estudiantes: number;
  visitas: number;
  interacciones: number;
};

/** Ranking nacional por universidad (para el panel ejecutivo). */
export async function getReportByUniversity(): Promise<UniReportRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("report_by_university");
  if (error) {
    logIfError("report_by_university", error);
    return [];
  }
  return (data ?? []) as UniReportRow[];
}
