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

/**
 * Igual que unwrap, pero LANZA el error en vez de devolver una lista vacía.
 *
 * POR QUÉ ES DISTINTO, Y POR QUÉ IMPORTA
 * Las páginas públicas se generan cada 60 segundos y el resultado queda
 * cacheado para todo el mundo. Si en el momento exacto de regenerarla la base
 * tiene un hipo, `data` viene null: la página se arma con CERO universidades y
 * esa versión vacía se le sirve a cada visitante durante el minuto siguiente.
 * Desde afuera se ve como "el Campus no carga", de forma intermitente y sin
 * ninguna señal.
 *
 * Al lanzar, Next NO cachea el resultado fallido: sigue sirviendo la última
 * versión buena que tenía guardada. Un problema momentáneo de la base deja de
 * ser una página rota para todos y pasa a ser invisible.
 *
 * Ojo con la distinción: una lista vacía LEGÍTIMA (todavía no hay noticias) no
 * es un error y pasa sin problema. Solo se lanza cuando la consulta falló.
 */
export function unwrapOrThrow<T>(
  context: string,
  res: { data: T | null; error: SupabaseLikeError },
  fallback: T,
): T {
  if (res.error) {
    logIfError(context, res.error);
    throw new Error(`[supabase] ${context}: ${res.error.message ?? "error desconocido"}`);
  }
  return res.data ?? fallback;
}
