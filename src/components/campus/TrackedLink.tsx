"use client";

import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export type ClickKind = "news" | "opportunities" | "professors" | "drives";

/** Suma un clic una sola vez por sesión (evita inflar por recargas). */
export function trackClick(kind: ClickKind, id: string) {
  try {
    const k = `clk:${kind}:${id}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
    // Fire-and-forget: no bloquea la navegación. La función solo incrementa.
    createClient().rpc("bump_click", { kind, row_id: id });
  } catch {
    // el tracking nunca debe romper la UX
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
