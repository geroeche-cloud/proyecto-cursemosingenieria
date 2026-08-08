/**
 * Paginación de las listas del panel y la administración.
 *
 * Sin esto, cada lista traía TODAS las filas de la universidad. Con treinta
 * noticias no se nota; con quinientas es el mismo problema que ya arreglamos en
 * las pantallas de inicio, solo que corrido a otra pantalla.
 *
 * 20 por página: entra cómodo en un celular sin scroll infinito, y el pedido a
 * la base queda chico y predecible sin importar cuánto haya publicado nadie.
 */
export const POR_PAGINA = 20;

export type Pagina = {
  /** Número de página, empezando en 1. */
  numero: number;
  /** Primer índice para .range() de Supabase. */
  desde: number;
  /** Último índice para .range() de Supabase. */
  hasta: number;
};

type Params = Record<string, string | string[] | undefined>;

/**
 * Tope de páginas. El número viene de la URL, así que lo escribe cualquiera:
 * sin tope, un ?pagina=999999999999999999999 genera un rango que ya no es un
 * entero representable y termina en un pedido sin sentido a la base.
 * 100.000 páginas son dos millones de filas: nadie va a llegar ahí navegando.
 */
const MAX_PAGINA = 100_000;

/** Lee ?pagina=N de la URL. Cualquier valor raro cae en la página 1. */
export function leerPagina(params: Params | undefined, porPagina = POR_PAGINA): Pagina {
  const crudo = params?.pagina;
  const n = Number(Array.isArray(crudo) ? crudo[0] : crudo);
  const numero =
    Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), MAX_PAGINA) : 1;
  const desde = (numero - 1) * porPagina;
  return { numero, desde, hasta: desde + porPagina - 1 };
}

/** Cantidad total de páginas para un total de filas dado. */
export function totalPaginas(total: number | null, porPagina = POR_PAGINA): number {
  return Math.max(1, Math.ceil((total ?? 0) / porPagina));
}
