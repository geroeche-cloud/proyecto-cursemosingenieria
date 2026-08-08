/**
 * Saneo de enlaces cargados por personas.
 *
 * POR QUÉ EXISTE
 * Los enlaces de drives, oportunidades y redes sociales los escribe alguien:
 * un embajador o el administrador. Se guardaban tal cual y se renderizaban tal
 * cual en el `href`.
 *
 * Un enlace que empieza con `javascript:` NO navega a ningún lado: ejecuta
 * código en el navegador de quien lo toca. Es decir, un embajador podía dejar
 * un enlace preparado y ese código correría en el navegador de cualquier
 * estudiante que entrara a su universidad. No es un ataque anónimo —hace falta
 * una cuenta— pero es exactamente la clase de cosa que un embajador NO debería
 * poder hacerle a los visitantes.
 *
 * Se sanea en dos lugares a propósito: al guardar (para que no entre basura) y
 * al mostrar (para lo que ya esté guardado desde antes). Si una de las dos
 * capas falla, la otra sigue en pie.
 */

/** Esquemas que sí pueden ir en un enlace. Todo lo demás se descarta. */
const PERMITIDOS = new Set(["http:", "https:", "mailto:"]);

/**
 * Devuelve el enlace si es seguro, o null si no lo es.
 *
 * Si viene sin esquema (alguien escribe "drive.google.com/..."), se asume
 * https, que es lo que la persona quiso decir.
 */
export function urlSegura(crudo: string | null | undefined): string | null {
  const s = (crudo ?? "").trim();
  if (!s) return null;

  // Sin esquema y con pinta de dominio: se completa con https.
  const conEsquema = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s) ? s : `https://${s}`;

  try {
    const u = new URL(conEsquema);
    if (!PERMITIDOS.has(u.protocol)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Igual que urlSegura, pero devuelve "#" en vez de null: sirve para el href. */
export function hrefSeguro(crudo: string | null | undefined): string {
  return urlSegura(crudo) ?? "#";
}
