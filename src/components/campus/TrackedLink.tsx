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

const CONTENIDO = ["news", "opportunities", "professors", "drives"];
let avisoMigracion = false;

/**
 * Envía el evento al servidor (el freno anti-abuso vive en la base).
 *
 * Si la migración de informes todavía no corrió, `track_event` no existe:
 * en ese caso los clics de contenido siguen contando con `bump_click`, y las
 * visitas y clics a redes simplemente esperan. Se avisa una sola vez por
 * sesión para no ensuciar la consola.
 */
export function sendEvent(kind: EventKind, id: string) {
  const supabase = createClient();
  supabase
    .rpc("track_event", { p_kind: kind, p_row: id, p_vid: getVisitorId() })
    .then(({ error }) => {
      if (!error) return;

      // PGRST202 = la función no existe todavía con esos nombres de parámetro.
      if (error.code === "PGRST202") {
        if (!avisoMigracion) {
          avisoMigracion = true;
          console.info(
            "[informes] Métricas en espera: falta correr la migración 0010 en Supabase. " +
              "Los clics se siguen contando.",
          );
        }
        if (CONTENIDO.includes(kind)) {
          supabase.rpc("bump_click", { kind, row_id: id }).then(() => {});
        }
        return;
      }

      console.error("[informes] no se pudo registrar:", error.message);
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
