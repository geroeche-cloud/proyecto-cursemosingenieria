/**
 * Monitoreo de errores en el NAVEGADOR (sitio público, panel y admin).
 *
 * CARGA DIFERIDA — decisión de arquitectura.
 * Sentry pesa unos 200 KB. Importarlo acá arriba lo metía en el arranque de
 * TODAS las páginas: cada visitante lo descargaba y ejecutaba antes de poder
 * usar el sitio, para una herramienta que solo sirve cuando algo falla.
 *
 * Ahora se cargan primero dos escuchas nativas de 20 líneas que guardan lo que
 * pase, y la librería recién entra cuando el navegador está desocupado. Al
 * llegar, se le entregan los errores guardados. NO se pierde ninguno: los que
 * ocurren durante la carga —los más importantes, porque son los que rompen la
 * primera impresión— quedan en el buffer y se reportan igual.
 *
 * Sin DSN configurado no se carga nada: cero peso, cero llamadas de red.
 *
 * Configuración pensada para el plan gratuito (5.000 errores/mes): sin
 * grabación de sesión ni trazas de rendimiento, que son los que consumen la
 * cuota y agregan peso.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

type Pendiente = { error: unknown; origen: string };
const pendientes: Pendiente[] = [];
let listo = false;

const RUIDO: (string | RegExp)[] = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",
  "Non-Error promise rejection captured",
  /extension\//i,
  /^chrome-extension:\/\//i,
  "NetworkError when attempting to fetch resource.",
  "Failed to fetch",
  "Load failed",
];

async function cargarSentry() {
  if (listo || !dsn) return;
  listo = true;

  const Sentry = await import("@sentry/nextjs");

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    ignoreErrors: RUIDO,
    beforeSend(event) {
      // Errores originados en extensiones del navegador: no son nuestros.
      const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
      const deExtension = frames.some((f) =>
        /chrome-extension|moz-extension|safari-extension/.test(f.filename ?? ""),
      );
      return deExtension ? null : event;
    },
  });

  // Se entregan los errores que ocurrieron mientras la librería no estaba.
  for (const p of pendientes.splice(0)) {
    Sentry.captureException(p.error, { tags: { origen: p.origen } });
  }
}

/** Guarda un error para reportarlo apenas Sentry esté disponible. */
export function reportar(error: unknown, origen = "manual") {
  if (!dsn) return;
  if (listo) {
    import("@sentry/nextjs").then((S) =>
      S.captureException(error, { tags: { origen } }),
    );
    return;
  }
  // Tope de seguridad: un bucle de errores no debe consumir memoria sin freno.
  if (pendientes.length < 20) pendientes.push({ error, origen });
  void cargarSentry();
}

if (dsn && typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    if (pendientes.length < 20) pendientes.push({ error: e.error ?? e.message, origen: "window" });
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (pendientes.length < 20) pendientes.push({ error: e.reason, origen: "promesa" });
  });

  const arrancar = () => void cargarSentry();
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(arrancar, { timeout: 3000 });
  } else {
    window.setTimeout(arrancar, 2000);
  }
}

/**
 * Next.js pide este export para seguir las navegaciones. Sin trazas de
 * rendimiento activadas no tiene nada que hacer, así que no justifica adelantar
 * la carga de la librería.
 */
export function onRouterTransitionStart() {}
