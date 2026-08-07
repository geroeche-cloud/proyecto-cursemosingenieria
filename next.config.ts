import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Content-Security-Policy tuned for this self-contained site:
// self-hosted fonts (next/font), next/image (data/blob), inline styles from
// Tailwind + Motion, and one inline JSON-LD script.
const isDev = process.env.NODE_ENV !== "production";

// Origen de Supabase — habilita auth, datos, realtime y storage desde el navegador.
let supabaseOrigin = "";
try {
  supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : "";
} catch {
  supabaseOrigin = "";
}
const supabaseWs = supabaseOrigin.replace(/^https/, "wss");

// Origen de Sentry — sin esto, la política de seguridad bloquearía el envío de
// errores y el monitoreo no reportaría nada (fallando, además, en silencio).
let sentryOrigin = "";
try {
  sentryOrigin = process.env.NEXT_PUBLIC_SENTRY_DSN
    ? new URL(process.env.NEXT_PUBLIC_SENTRY_DSN).origin
    : "";
} catch {
  sentryOrigin = "";
}

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `img-src 'self' data: blob:${supabaseOrigin ? " " + supabaseOrigin : ""}`,
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // 'unsafe-eval' only in dev (React dev tooling); strict in production.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self'${supabaseOrigin ? " " + supabaseOrigin + " " + supabaseWs : ""}${sentryOrigin ? " " + sentryOrigin : ""}${isDev ? " ws:" : ""}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Las fotos de embajadores viven en Supabase Storage: se optimizan y se
    // sirven en el tamaño que pide cada dispositivo (clave en celular).
    remotePatterns: supabaseOrigin
      ? [{ protocol: "https", hostname: new URL(supabaseOrigin).hostname, pathname: "/storage/**" }]
      : [],
    formats: ["image/avif", "image/webp"],
  },
  // Las Server Actions aceptan 1MB por defecto; subimos el límite para permitir
  // la carga de fotos de embajadores (hasta 5MB) vía Supabase Storage.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  // El diagnóstico muestra el SQL exacto de cada arreglo leyendo el archivo
  // real del repo. Sin esto, los .sql no viajan al servidor en Vercel y el
  // panel mostraría el problema pero no la solución.
  outputFileTracingIncludes: {
    "/admin/diagnostico": ["./supabase/migrations/*.sql"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

/**
 * Sentry solo se enchufa si hay DSN configurado. Sin él, el proyecto compila y
 * se despliega exactamente igual que antes: cero peso agregado, cero cambios.
 */
export default sentryOrigin
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Sin token no se suben mapas de código; el build sigue funcionando.
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      // Menos peso en el navegador: se quitan los mensajes de depuración.
      disableLogger: true,
      // Evita que los bloqueadores de publicidad corten el envío de errores.
      tunnelRoute: "/monitoring",
    })
  : nextConfig;
