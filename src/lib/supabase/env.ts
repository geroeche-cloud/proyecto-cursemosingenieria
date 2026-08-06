/**
 * Variables de entorno de Supabase — con saneo TOLERANTE.
 *
 * Aprendizaje (importante): antes validábamos de forma estricta y hacíamos
 * `throw` en el build si el valor venía raro. Eso, en Vercel, hacía FALLAR todo
 * el deploy cuando una env var tenía un salto de línea o texto pegado por error.
 * Peor el remedio que la enfermedad.
 *
 * Ahora: saneamos siempre (tomamos el primer token válido, que descarta saltos
 * de línea o contenido pegado) y NUNCA tiramos error en el build. Si algo está
 * raro, lo avisamos por consola (visible en los logs), pero el deploy sigue.
 *
 * La service_role NUNCA se expone al navegador — vive solo en admin.ts (servidor).
 */

/** Recorta y toma el primer token: descarta saltos de línea o contenido pegado. */
export function firstToken(v: string | undefined): string {
  return (v ?? "").trim().split(/\s+/)[0] ?? "";
}

const rawUrl = firstToken(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = firstToken(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Normalizamos la URL a su origen (descarta ruta, barra final o querystring).
// Si por algún motivo no parsea, usamos el valor saneado tal cual (no rompemos).
let url = rawUrl;
try {
  if (rawUrl) url = new URL(rawUrl).origin;
} catch {
  if (typeof window === "undefined") {
    console.error(`[supabase] NEXT_PUBLIC_SUPABASE_URL con formato inesperado: "${rawUrl}"`);
  }
}

// Aviso (no bloqueante) si falta algo o la key no parece un JWT.
if (typeof window === "undefined") {
  if (!url || !anonKey) {
    console.error("[supabase] Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  } else if (!anonKey.startsWith("eyJ")) {
    console.error("[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY no parece un JWT (no empieza con 'eyJ').");
  }
}

export const supabaseUrl: string = url;
export const supabaseAnonKey: string = anonKey;
