/**
 * Esqueletos de carga: mientras el servidor responde, la pantalla muestra la
 * forma de lo que viene en vez de quedarse congelada. Es la diferencia entre
 * sentir que la plataforma es rápida o que se colgó.
 */

export function Bloque({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
}

/** Carga genérica de una sección del panel: título + tarjetas + lista. */
export function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Cargando">
      <div className="flex flex-col gap-2">
        <Bloque className="h-6 w-52" />
        <Bloque className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-hair p-5">
            <Bloque className="h-3 w-24" />
            <Bloque className="mt-3 h-8 w-20" />
            <Bloque className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-hair">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-hair px-5 py-4 last:border-0">
            <div className="flex-1">
              <Bloque className="h-4 w-2/3" />
              <Bloque className="mt-2 h-3 w-1/3" />
            </div>
            <Bloque className="h-8 w-20 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
