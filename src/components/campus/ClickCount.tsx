"use client";

import { useEffect, useState } from "react";
import { CLICK_EVENT, type ClickKind } from "./TrackedLink";

/**
 * Recuento de clics de una publicación.
 *
 * Arranca con el valor que vino de la base y sube al instante cuando la persona
 * hace clic en esa misma publicación (la página pública es cacheada, así que sin
 * esto el número recién cambiaría en la próxima regeneración).
 */
export function ClickCount({
  kind,
  id,
  clicks,
}: {
  kind: ClickKind;
  id: string;
  clicks?: number | null;
}) {
  const server = clicks ?? 0;
  const [n, setN] = useState(server);
  const [lastServer, setLastServer] = useState(server);

  // Si el servidor trae un número más nuevo (al revalidarse la página), se toma.
  // Ajuste durante el render: es el patrón de React para sincronizar con props,
  // sin el efecto en cascada que provoca hacerlo dentro de useEffect.
  if (server !== lastServer) {
    setLastServer(server);
    setN((prev) => Math.max(prev, server));
  }

  useEffect(() => {
    const onClick = (e: Event) => {
      const d = (e as CustomEvent<{ kind: string; id: string }>).detail;
      if (d?.kind === kind && d?.id === id) setN((v) => v + 1);
    };
    window.addEventListener(CLICK_EVENT, onClick);
    return () => window.removeEventListener(CLICK_EVENT, onClick);
  }, [kind, id]);

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-mute"
      title={`${n} ${n === 1 ? "clic" : "clics"} en total`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden>
        <path d="M9 11.5V5a1.5 1.5 0 0 1 3 0v6" />
        <path d="M12 11V4.5a1.5 1.5 0 0 1 3 0V11" />
        <path d="M15 11V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.2-3l-2-3.4a1.5 1.5 0 0 1 2.6-1.5L9 14" />
      </svg>
      {n} {n === 1 ? "clic" : "clics"}
    </span>
  );
}
