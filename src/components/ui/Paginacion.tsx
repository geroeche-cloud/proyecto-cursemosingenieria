import Link from "next/link";

type Props = {
  /** Ruta base, sin querystring. Ej: "/panel/noticias" */
  base: string;
  pagina: number;
  paginas: number;
  /** Total de filas, para mostrar el contexto ("81 en total"). */
  total: number | null;
  /** Cómo nombrar lo que se lista, en plural. Ej: "noticias" */
  que: string;
};

/**
 * Navegación entre páginas. Enlaces reales (no botones con JavaScript) para que
 * se pueda abrir en otra pestaña, compartir el enlace y volver con el botón
 * "atrás" del navegador.
 */
export function Paginacion({ base, pagina, paginas, total, que }: Props) {
  if (paginas <= 1) return null;

  const href = (n: number) => (n <= 1 ? base : `${base}?pagina=${n}`);
  const anterior = pagina > 1;
  const siguiente = pagina < paginas;

  const enlace =
    "rounded-lg border border-hair px-3 py-2 text-xs font-medium text-ink transition hover:bg-white/5";
  const apagado = "rounded-lg border border-hair px-3 py-2 text-xs text-ink-mute opacity-40";

  return (
    <nav
      className="mt-5 flex flex-wrap items-center justify-between gap-3"
      aria-label={`Páginas de ${que}`}
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-mute">
        Página {pagina} de {paginas}
        {total !== null && ` · ${total} ${que} en total`}
      </p>

      <div className="flex items-center gap-2">
        {anterior ? (
          <Link href={href(pagina - 1)} className={enlace} rel="prev">
            ← Anterior
          </Link>
        ) : (
          <span className={apagado}>← Anterior</span>
        )}
        {siguiente ? (
          <Link href={href(pagina + 1)} className={enlace} rel="next">
            Siguiente →
          </Link>
        ) : (
          <span className={apagado}>Siguiente →</span>
        )}
      </div>
    </nav>
  );
}
