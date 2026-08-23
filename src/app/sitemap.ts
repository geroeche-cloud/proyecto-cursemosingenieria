import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";
import { rutaNoticia, rutaOportunidad } from "@/lib/publicaciones";
import { isActiveNow } from "@/lib/schedule";

export const revalidate = 3600;

/**
 * Tope de publicaciones listadas en el sitemap, las más nuevas primero.
 *
 * No es el tope de lo que Google indexa —los enlaces desde cada campus llevan
 * al resto— sino de lo que se le señala como prioritario. Sin tope, la
 * consulta crecería sin límite con los años (regla 7 de RENDIMIENTO.md), y un
 * sitemap de cincuenta mil entradas viejas tampoco ayuda a nadie.
 */
const TOPE_PUBLICACIONES = 500;

/**
 * Sitemap real: portada, campus, novedades, una entrada por universidad activa
 * y una por publicación vigente.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/campus`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/novedades`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    // Prioridad baja: no se busca, pero tiene que ser encontrable.
    {
      url: `${SITE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("universities")
      .select("id, slug")
      .eq("status", "active");

    const unis = (data ?? []) as { id: string; slug: string }[];
    for (const u of unis) {
      base.push({
        url: `${SITE_URL}/campus/${u.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    // El slug de cada universidad, para armar la dirección de sus publicaciones.
    const slugDe = new Map(unis.map((u) => [u.id, u.slug]));

    const [noticias, oportunidades] = await Promise.all([
      supabase
        .from("news")
        .select("id, university_id, starts_at, ends_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(TOPE_PUBLICACIONES),
      supabase
        .from("opportunities")
        .select("id, university_id, starts_at, ends_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(TOPE_PUBLICACIONES),
    ]);

    type Pub = { id: string; university_id: string; starts_at: string | null; ends_at: string | null };

    // Solo las vigentes: señalarle a Google una convocatoria vencida es
    // invitarlo a mandar gente a algo en lo que ya no puede participar.
    // (Las vencidas siguen existiendo para quien tenga el enlace, pero con
    // `noindex` — lo declara su propia página.)
    for (const n of (noticias.data ?? []) as Pub[]) {
      const slug = slugDe.get(n.university_id);
      if (slug && isActiveNow(n.starts_at, n.ends_at)) {
        base.push({
          url: `${SITE_URL}${rutaNoticia(slug, n.id)}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
    for (const o of (oportunidades.data ?? []) as Pub[]) {
      const slug = slugDe.get(o.university_id);
      if (slug && isActiveNow(o.starts_at, o.ends_at)) {
        base.push({
          url: `${SITE_URL}${rutaOportunidad(slug, o.id)}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // Si la base no responde, servimos igual el sitemap con las rutas fijas.
  }

  return base;
}
