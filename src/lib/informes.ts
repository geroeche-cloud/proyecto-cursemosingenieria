// SOLO SERVIDOR: createAdminClient ya se niega a correr en el navegador.
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { logIfError } from "@/lib/log";
import { STATS_VACIAS, type Stats } from "@/components/informes/ReportBits";

/**
 * Cuánto vive un informe antes de recalcularse. Es la pieza que decide si la
 * plataforma aguanta a escala.
 *
 * Sin esto, CADA vez que alguien abre su informe se recorre la tabla de
 * eventos entera para contar personas distintas. Con 20.000 estudiantes eso
 * son millones de filas por consulta, y basta con que unos pocos embajadores
 * refresquen para saturar la base.
 *
 * Con una hora de vida: por más gente que mire, el cálculo pesado corre como
 * mucho una vez por hora y por universidad. El resto se sirve desde memoria.
 */
const VIDA_INFORME = 3600; // segundos

async function leerStats(universityId: string | null) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("report_stats", { p_uni: universityId });
  if (error) {
    logIfError("report_stats", error);
    return { stats: STATS_VACIAS, listo: false };
  }
  return { stats: { ...STATS_VACIAS, ...(data as Partial<Stats>) }, listo: true };
}

const leerStatsCacheado = unstable_cache(leerStats, ["informe-stats"], {
  revalidate: VIDA_INFORME,
  tags: ["informes"],
});

/**
 * Lee todos los números de un informe en UNA llamada a la base
 * (función report_stats de la migración 0010). Solo servidor.
 */
export async function getReportStats(universityId: string | null): Promise<{
  stats: Stats;
  listo: boolean; // false si la migración 0010 todavía no corrió
}> {
  return leerStatsCacheado(universityId);
}

export type UniReportRow = {
  university_id: string;
  estudiantes: number;
  visitas: number;
  interacciones: number;
};

async function leerPorUniversidad(): Promise<UniReportRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("report_by_university");
  if (error) {
    logIfError("report_by_university", error);
    return [];
  }
  return (data ?? []) as UniReportRow[];
}

const leerPorUniversidadCacheado = unstable_cache(
  leerPorUniversidad,
  ["informe-por-universidad"],
  { revalidate: VIDA_INFORME, tags: ["informes"] },
);

/** Ranking nacional por universidad (para el panel ejecutivo). */
export async function getReportByUniversity(): Promise<UniReportRow[]> {
  return leerPorUniversidadCacheado();
}
