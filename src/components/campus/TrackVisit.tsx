"use client";

import { useEffect } from "react";
import { sendEvent } from "./TrackedLink";

/**
 * Registra la visita al campus de una universidad — la métrica de alcance de
 * los informes ("estudiantes alcanzados"). Una vez por sesión de navegación;
 * el servidor además deduplica por visitante y día. No renderiza nada.
 */
export function TrackVisit({ universityId }: { universityId: string }) {
  useEffect(() => {
    try {
      const k = `visit:${universityId}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
      sendEvent("visit", universityId);
    } catch {
      // nunca romper la página por medir
    }
  }, [universityId]);

  return null;
}
