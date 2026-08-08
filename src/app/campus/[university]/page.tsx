import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CampusView,
  type CampusNews,
  type CampusOpp,
  type CampusProf,
  type CampusDrive,
} from "@/components/campus/CampusView";
import { createPublicClient } from "@/lib/supabase/public";
import { isActiveNow } from "@/lib/schedule";
import { AMB_COLS, buildAmbassador, type AmbassadorRaw } from "@/lib/ambassador";
import { logIfError } from "@/lib/log";

export const revalidate = 60;

/**
 * Qué universidades se generan en el momento del despliegue.
 *
 * Se genera un tope, NO todas. Con quinientas universidades, generarlas todas
 * en cada despliegue convertiría un build de un minuto en uno de varios, y ese
 * costo se paga en cada cambio por chico que sea.
 *
 * Las que quedan fuera no se rompen: Next las genera sola la primera vez que
 * alguien las visita y a partir de ahí quedan cacheadas igual que el resto.
 * Solo el primer visitante de una universidad poco vista espera un poco más.
 */
const PREGENERADAS = 60;

export async function generateStaticParams() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("universities")
      .select("slug")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(PREGENERADAS);
    return (data ?? []).map((u: { slug: string }) => ({ university: u.slug }));
  } catch {
    // Si la base no responde durante el build, no se cae el despliegue: las
    // páginas se generan bajo demanda.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ university: string }>;
}): Promise<Metadata> {
  const { university } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("universities")
    .select("name, short_name")
    .eq("slug", university)
    .maybeSingle();
  return { title: data ? `${data.short_name || data.name} · Campus` : "Campus" };
}

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ university: string }>;
}) {
  const { university } = await params;
  const supabase = createPublicClient();

  const uniRes = await supabase
    .from("universities")
    .select("id, name, short_name, city, slug")
    .eq("slug", university)
    .eq("status", "active")
    .maybeSingle();

  // Distinguir "no existe" de "falló la consulta" es crítico acá.
  // Antes ambos casos terminaban en notFound(), y como esta página se cachea,
  // un hipo momentáneo de la base dejaba la universidad devolviendo 404 a todo
  // el mundo. Ahora un fallo LANZA: Next conserva la última versión buena.
  if (uniRes.error) {
    logIfError(`campus/${university} universidad`, uniRes.error);
    throw new Error(`[supabase] campus/${university}: ${uniRes.error.message}`);
  }
  const uni = uniRes.data;
  if (!uni) notFound();

  const uid = uni.id;
  const [newsRes, oppRes, profRes, driveRes, ambProfileRes] = await Promise.all([
    supabase.from("news").select("id, title, summary, body, starts_at, ends_at, clicks").eq("university_id", uid).eq("status", "published").order("published_at", { ascending: false }).limit(30),
    supabase.from("opportunities").select("id, kind, title, org, description, deadline, requirements, href, starts_at, ends_at, clicks").eq("university_id", uid).eq("status", "published").order("created_at", { ascending: false }).limit(60),
    supabase.from("professors").select("id, name, title, modality, subjects, whatsapp, clicks").eq("university_id", uid).eq("status", "published").order("created_at", { ascending: false }).limit(100),
    supabase.from("drives").select("id, owner, career, href, clicks").eq("university_id", uid).eq("status", "published").order("created_at", { ascending: false }).limit(100),
    supabase.from("ambassador_profiles").select(AMB_COLS).eq("university_id", uid).maybeSingle(),
  ]);

  // Si el CONTENIDO de la universidad falla, tampoco se cachea una página
  // vacía: se lanza y Next sigue sirviendo la última versión buena. Una
  // sección legítimamente vacía (todavía no cargaron profesores) no es error
  // y pasa sin problema — solo se lanza cuando la consulta falló.
  for (const [que, res] of [
    ["news", newsRes],
    ["opportunities", oppRes],
    ["professors", profRes],
    ["drives", driveRes],
    ["ambassador_profile", ambProfileRes],
  ] as const) {
    if (res.error) {
      logIfError(`campus/${university} ${que}`, res.error);
      throw new Error(`[supabase] campus/${university} ${que}: ${res.error.message}`);
    }
  }

  const news = ((newsRes.data ?? []) as CampusNews[]).filter((n) =>
    isActiveNow(n.starts_at ?? null, n.ends_at ?? null),
  );
  const opportunities = ((oppRes.data ?? []) as CampusOpp[]).filter((o) =>
    isActiveNow(o.starts_at ?? null, o.ends_at ?? null),
  );
  const professors = (profRes.data ?? []) as CampusProf[];
  const drives = (driveRes.data ?? []) as CampusDrive[];
  const ambassador = buildAmbassador(ambProfileRes.data as AmbassadorRaw, uni.name, uni.id);

  return (
    <CampusView
      uni={uni}
      news={news}
      opportunities={opportunities}
      professors={professors}
      drives={drives}
      ambassador={ambassador}
    />
  );
}
