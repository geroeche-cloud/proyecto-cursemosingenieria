"use client";

import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export type ClickKind = "news" | "opportunities" | "professors" | "drives";

/** Evento interno para que el contador en pantalla suba al instante. */
export const CLICK_EVENT = "cursemos:click";

/**
 * Suma un clic (una sola vez por sesión, para no inflar por recargas).
 *
 * Importante: el builder de Supabase es "lazy" — `rpc(...)` arma la consulta
 * pero recién la envía cuando se encadena un `.then()`. Sin eso la petición
 * nunca sale, que es exactamente por qué los contadores quedaban en cero.
 */
export function trackClick(kind: ClickKind, id: string) {
  try {
    const k = `clk:${kind}:${id}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");

    // El contador visible sube ya; la base se actualiza en paralelo.
    window.dispatchEvent(new CustomEvent(CLICK_EVENT, { detail: { kind, id } }));

    createClient()
      .rpc("bump_click", { kind, row_id: id })
      .then(({ error }) => {
        if (error) console.error("[clics] no se pudo registrar:", error.message);
      });
  } catch {
    // el tracking nunca debe romper la navegación
  }
}

/** Link externo que registra un clic (salvo en modo vista previa). */
export function TrackedLink({
  kind,
  id,
  href,
  track = true,
  className,
  children,
}: {
  kind: ClickKind;
  id: string;
  href: string;
  track?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track && trackClick(kind, id)}
      className={className}
    >
      {children}
    </a>
  );
}
