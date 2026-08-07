import * as Sentry from "@sentry/nextjs";

/**
 * Monitoreo de errores del SERVIDOR (páginas, acciones del panel, informes).
 * Sin DSN no se inicializa nada.
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
  }
}

/** Captura los errores de renderizado del servidor con su contexto de ruta. */
export const onRequestError = Sentry.captureRequestError;
