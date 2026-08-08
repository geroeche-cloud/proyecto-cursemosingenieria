"use client";

import { useEffect } from "react";
import { reportar } from "@/instrumentation-client";

/**
 * ÚLTIMA LÍNEA DE DEFENSA.
 *
 * `error.tsx` cubre los fallos dentro de una página, pero corre DENTRO del
 * layout raíz. Si el que falla es el layout mismo, no hay nadie que lo agarre:
 * Next muestra su pantalla genérica en blanco, sin marca, en inglés y sin
 * ninguna salida. Eso es exactamente "una pantalla rota".
 *
 * Este archivo es el único que Next usa en ese caso. Reemplaza al documento
 * entero, así que tiene que traer sus propias etiquetas <html> y <body> y no
 * puede depender de NADA del proyecto: ni de los estilos globales (que podrían
 * ser justamente lo que falló), ni de componentes, ni de fuentes.
 *
 * Por eso los estilos van escritos a mano, en línea. No es descuido: es la
 * pantalla que tiene que funcionar cuando ya no funciona nada más.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] fallo del layout raíz:", error.message, error.digest ?? "");
    reportar(error, "layout-raiz");
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06070c",
          color: "#f4f6fa",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#9cb6ff",
            }}
          >
            Cursemos Ingeniería
          </p>
          <h1 style={{ margin: "0.75rem 0 0", fontSize: "1.5rem", fontWeight: 700 }}>
            El sitio tuvo un problema
          </h1>
          <p style={{ margin: "0.5rem 0 0", lineHeight: 1.6, color: "#a7aebc" }}>
            No perdiste nada. Probá recargar; si sigue pasando, escribinos y lo resolvemos.
          </p>

          <div
            style={{
              marginTop: "1.75rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: "999px",
                padding: "0.8rem 1.6rem",
                background: "#3b6bff",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
            {/* <a> a propósito, no <Link>. Esta pantalla reemplaza el
                documento entero y aparece cuando falló el layout raíz: el
                enrutador de Next puede ser justamente lo que se rompió.
                Un enlace común no depende de nada y siempre funciona. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "999px",
                padding: "0.8rem 1.6rem",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#f4f6fa",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Ir al inicio
            </a>
          </div>

          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.62rem", color: "#3d4350" }}>
              Referencia: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
