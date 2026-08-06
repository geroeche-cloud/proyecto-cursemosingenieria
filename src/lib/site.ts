/**
 * URL pública del sitio — fuente única de verdad para SEO (metadata, sitemap,
 * robots y JSON-LD).
 *
 * Orden de resolución:
 *   1. NEXT_PUBLIC_SITE_URL  → definila en Vercel cuando conectes el dominio real.
 *   2. VERCEL_PROJECT_PRODUCTION_URL → dominio de producción que Vercel inyecta solo.
 *   3. localhost → desarrollo.
 *
 * Antes había cuatro copias de la URL hardcodeadas en distintos archivos, lo que
 * dejó apuntando el SEO a un dominio viejo. Con esto se cambia en un solo lugar.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Cursemos Ingeniería";
