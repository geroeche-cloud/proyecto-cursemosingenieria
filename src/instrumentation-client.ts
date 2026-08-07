import * as Sentry from "@sentry/nextjs";

/**
 * Monitoreo de errores en el NAVEGADOR (sitio público, panel y admin).
 *
 * Sin DSN configurado no se inicializa: el sitio funciona igual y no se
 * agrega ninguna llamada de red. Para activarlo, cargar NEXT_PUBLIC_SENTRY_DSN
 * en Vercel → Settings → Environment Variables.
 *
 * Configuración pensada para el plan gratuito (5.000 errores/mes):
 * sin grabación de sesión ni trazas de rendimiento, que son los que consumen
 * la cuota y agregan peso a la página.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Sin muestreo de rendimiento: solo nos interesan los errores.
    tracesSampleRate: 0,

    // No enviar datos personales (mails, contenido de formularios).
    sendDefaultPii: false,

    // Ruido que no es culpa de la plataforma y gastaría la cuota gratuita.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      /extension\//i,
      /^chrome-extension:\/\//i,
      "NetworkError when attempting to fetch resource.",
      "Failed to fetch",
      "Load failed",
    ],

    beforeSend(event) {
      // Errores originados en extensiones del navegador: no son nuestros.
      const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
      const deExtension = frames.some((f) =>
        /chrome-extension|moz-extension|safari-extension/.test(f.filename ?? ""),
      );
      return deExtension ? null : event;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
