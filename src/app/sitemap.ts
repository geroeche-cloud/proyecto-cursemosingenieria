import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

/** Sitemap real: portada, campus, novedades y una entrada por universidad activa. */
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
      .select("slug")
      .eq("status", "active");

    for (const u of (data ?? []) as { slug: string }[]) {
      base.push({
        url: `${SITE_URL}/campus/${u.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch {
    // Si la base no responde, servimos igual el sitemap con las rutas fijas.
  }

  return base;
}
