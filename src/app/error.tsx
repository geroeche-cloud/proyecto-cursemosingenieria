"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Pantalla de error de la aplicación. Sin esto, cualquier fallo mostraba la
 * pantalla genérica de Next.js. Acá el mensaje es humano, la marca se sostiene
 * y hay una salida clara.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Queda registrado en los logs del servidor (Vercel → Runtime Logs).
    console.error("[app] error no controlado:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
          Cursemos Ingeniería
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
          Algo no salió como esperábamos
        </h1>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Fue un problema puntual, no perdiste nada. Podés reintentar o volver al inicio.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-blue text-sm">
            Reintentar
          </button>
          <Link href="/" className="btn btn-ghost text-sm">
            Ir al inicio
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
