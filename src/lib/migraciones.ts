// SOLO SERVIDOR: lee del disco los archivos de migración del repo.
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Devuelve el contenido de una migración para mostrarlo listo para copiar.
 *
 * Se lee el archivo real en vez de duplicar el SQL dentro del código: una copia
 * pegada acá se desincronizaría en silencio del archivo del repo, y el panel
 * terminaría dictando un arreglo que ya no es el correcto. Justo el tipo de
 * problema que este panel existe para evitar.
 *
 * Para que el archivo viaje al servidor en Vercel, next.config.ts lo incluye
 * con outputFileTracingIncludes.
 */
export async function leerMigracion(archivo: string): Promise<string | undefined> {
  // Solo nombres de archivo simples: nunca una ruta armada desde afuera.
  if (!/^\d{4}_[a-z0-9_]+\.sql$/.test(archivo)) return undefined;
  try {
    const ruta = path.join(process.cwd(), "supabase", "migrations", archivo);
    return await readFile(ruta, "utf8");
  } catch {
    return undefined;
  }
}

/** Enlace directo al editor SQL del proyecto, sacado de la URL de Supabase. */
export function enlaceEditorSQL(supabaseUrl: string): string | undefined {
  try {
    const ref = new URL(supabaseUrl).hostname.split(".")[0];
    return ref ? `https://supabase.com/dashboard/project/${ref}/sql/new` : undefined;
  } catch {
    return undefined;
  }
}
