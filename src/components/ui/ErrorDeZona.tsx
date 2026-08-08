"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportar } from "@/instrumentation-client";

/**
 * Pantalla de error para el panel y la administración.
 *
 * Existe aparte de la general porque el contexto importa: si a un embajador le
 * falla algo mientras publica, mandarlo al inicio del sitio público lo deja
 * varado lejos de donde estaba. Acá la salida lo devuelve a SU panel.
 *
 * También cambia lo que se le dice. En el sitio público un fallo es una
 * molestia; en el panel, alguien puede estar preguntándose si perdió lo que
 * estaba escribiendo. La respuesta a eso va primero.
 */
export function ErrorDeZona({
  error,
  reset,
  volverA,
  etiqueta,
  zona,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  volverA: string;
  etiqueta: string;
  zona: string;
}) {
  useEffect(() => {
    console.error(`[${zona}] error:`, error.message, error.digest ?? "");
    reportar(error, zona);
  }, [error, zona]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 text-ink">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">{etiqueta}</p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
          No se pudo completar la acción
        </h1>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Lo que ya estaba guardado sigue guardado. Si estabas escribiendo algo y no llegaste a
          guardarlo, volvé atrás en el navegador para recuperar el texto.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-blue text-sm">
            Reintentar
          </button>
          <Link href={volverA} className="btn btn-ghost text-sm">
            Volver al panel
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 font-mono text-[0.62rem] text-ink-faint">
            Referencia: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
