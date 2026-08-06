/**
 * Registro de errores del servidor.
 *
 * Por qué existe: durante el incidente de producción, las lecturas a Supabase
 * fallaban con 401 y el código las descartaba en silencio (`data ?? []`), así
 * que el sitio se veía "vacío" sin ninguna señal. Ahora todo error de consulta
 * queda escrito en los logs (visibles en Vercel → Deployments → Runtime Logs),
 * con el contexto de dónde ocurrió.
 *
 * Si más adelante se suma Sentry u otro servicio, este es el único lugar
 * que hay que tocar.
 */

type SupabaseLikeError = { message?: string; code?: string; details?: string } | null;

/** Loguea el error de una consulta y devuelve el dato tal cual, para encadenar. */
export function logIfError(context: string, error: SupabaseLikeError): void {
  if (!error) return;
  const code = error.code ? ` [${error.code}]` : "";
  console.error(`[supabase]${code} ${context}: ${error.message ?? "error desconocido"}`);
}

/**
 * Desempaqueta una respuesta de Supabase: si vino error lo loguea y devuelve
 * el valor por defecto, evitando que un fallo pase inadvertido.
 */
export function unwrap<T>(
  context: string,
  res: { data: T | null; error: SupabaseLikeError },
  fallback: T,
): T {
  logIfError(context, res.error);
  return res.data ?? fallback;
}
