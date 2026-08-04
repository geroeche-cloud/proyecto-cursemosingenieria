import type { NextConfig } from "next";

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
  `connect-src 'self'${supabaseOrigin ? " " + supabaseOrigin + " " + supabaseWs : ""}${isDev ? " ws:" : ""}`,
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
