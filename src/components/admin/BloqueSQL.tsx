"use client";

import { useState } from "react";

type Props = {
  archivo: string;
  contenido: string;
  /** Enlace al editor SQL del proyecto, si se pudo deducir. */
  editor?: string;
};

/**
 * Muestra el SQL exacto de un arreglo, listo para copiar y pegar en Supabase.
 *
 * Arranca plegado a propósito: una migración puede tener cien líneas y el panel
 * tiene que seguir siendo legible de un vistazo.
 */
export function BloqueSQL({ archivo, contenido, editor }: Props) {
  const [copiado, setCopiado] = useState(false);
  const [abierto, setAbierto] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(contenido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin permiso de portapapeles: se abre el bloque para copiar a mano.
      setAbierto(true);
    }
  };

  const lineas = contenido.split("\n").length;

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-hair bg-black/30">
      <div className="flex flex-wrap items-center gap-2 border-b border-hair px-3 py-2">
        <code className="min-w-0 flex-1 truncate font-mono text-[0.7rem] text-ink-soft">
          {archivo}
        </code>

        <button
          type="button"
          onClick={copiar}
          className={`shrink-0 rounded-md border px-2.5 py-1 text-[0.7rem] font-medium transition ${
            copiado
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-hair text-ink hover:bg-white/5"
          }`}
        >
          {copiado ? "✓ Copiado" : "Copiar SQL"}
        </button>

        {editor && (
          <a
            href={editor}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md border border-hair px-2.5 py-1 text-[0.7rem] font-medium text-ink transition hover:bg-white/5"
          >
            Abrir Supabase ↗
          </a>
        )}

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="shrink-0 rounded-md px-2 py-1 text-[0.7rem] text-ink-soft transition hover:text-ink"
          aria-expanded={abierto}
        >
          {abierto ? "Ocultar" : `Ver (${lineas} líneas)`}
        </button>
      </div>

      {abierto && (
        <pre className="max-h-80 overflow-auto px-3 py-2.5 font-mono text-[0.68rem] leading-relaxed text-ink-soft">
          {contenido}
        </pre>
      )}
    </div>
  );
}
