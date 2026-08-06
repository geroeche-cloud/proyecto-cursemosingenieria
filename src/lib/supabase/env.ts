/**
 * Variables de entorno de Supabase — con saneo y validación estricta.
 *
 * Por qué: al copiar/pegar en Vercel es fácil dejar un salto de línea o texto
 * de más pegado a la key (o una barra/ruta de más en la URL). Antes eso pasaba
 * silencioso y el sitio quedaba "vacío" sin explicación. Ahora:
 *   1) saneamos (recortamos y tomamos solo el primer token válido), y
 *   2) validamos el formato y fallamos con un mensaje claro si algo está mal.
 *
 * La service_role NUNCA se expone al navegador — vive solo en admin.ts (servidor).
 */

/** Recorta y toma el primer token: descarta saltos de línea o contenido pegado. */
export function firstToken(v: string | undefined): string {
  return (v ?? "").trim().split(/\s+/)[0] ?? "";
}

const rawUrl = firstToken(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = firstToken(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!rawUrl || !anonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Definilas en .env.local (local) o en Vercel → Settings → Environment Variables.",
  );
}

// Normalizamos la URL a su origen: descarta ruta, barra final o querystring.
let origin: string;
try {
  origin = new URL(rawUrl).origin;
} catch {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL con formato inválido: "${rawUrl}". ` +
      "Tiene que ser https://<proyecto>.supabase.co (sin espacios, ruta ni barra final).",
  );
}

if (!anonKey.startsWith("eyJ")) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY no parece una key válida (debe empezar con 'eyJ'). " +
      "Revisá que no tenga saltos de línea ni texto pegado.",
  );
}

export const supabaseUrl: string = origin;
export const supabaseAnonKey: string = anonKey;
