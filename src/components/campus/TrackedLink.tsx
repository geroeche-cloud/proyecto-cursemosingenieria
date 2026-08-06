"use client";

import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";

/** Clics de contenido: suman en el contador visible de la publicación. */
export type ClickKind = "news" | "opportunities" | "professors" | "drives";

/** Todos los eventos medibles (contenido + visitas + redes del embajador). */
export type EventKind =
  | ClickKind
  | "visit"
  | "social:instagram"
  | "social:tiktok"
  | "social:youtube"
  | "social:linkedin"
  | "social:mail";

/** Evento interno para que el contador en pantalla suba al instante. */
export const CLICK_EVENT = "cursemos:click";

/** Envía el evento al servidor (el freno anti-abuso vive en la base). */
export function sendEvent(kind: EventKind, id: string) {
  createClient()
    .rpc("track_event", { kind, row_id: id, vid: getVisitorId() })
    .then(({ error }) => {
      if (error) console.error("[informes] no se pudo registrar:", error.message);
    });
}

/**
 * Registra un clic una sola vez por sesión (el servidor además deduplica por
 * visitante y día). Importante: el builder de Supabase es "lazy" — sin el
 * .then() del sendEvent la petición nunca saldría.
 */
export function trackClick(kind: EventKind, id: string) {
  try {
    const k = `clk:${kind}:${id}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");

    // El contador visible sube ya; la base se actualiza en paralelo.
    window.dispatchEvent(new CustomEvent(CLICK_EVENT, { detail: { kind, id } }));

    sendEvent(kind, id);
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
  kind: EventKind;
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
