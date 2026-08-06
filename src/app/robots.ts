import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Zonas privadas: back-office y flujos de cuenta. No deben indexarse.
      disallow: ["/admin", "/panel", "/preview", "/login", "/recuperar", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
