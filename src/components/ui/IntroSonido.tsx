"use client";

import { useEffect } from "react";

/**
 * Golpe cinematográfico sintetizado que acompaña a la intro.
 *
 * Se arma cuando el navegador está desocupado (requestIdleCallback), NO durante
 * la carga. Antes toda esta síntesis de audio competía por el hilo principal
 * justo en el momento en que Google mide cuándo aparece el contenido. El sonido
 * es un detalle estético; la velocidad de carga no.
 *
 * El código pesado se carga aparte y solo si de verdad va a sonar: si el
 * navegador bloquea el autoplay y la persona nunca toca la pantalla, nunca se
 * descarga.
 */
export function IntroSonido() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let cancelado = false;
    const arrancar = () => {
      if (cancelado) return;
      // Import diferido: el sintetizador no forma parte del arranque.
      import("@/lib/cue").then((m) => !cancelado && m.armarGolpe());
    };

    const idle = window.requestIdleCallback?.(arrancar, { timeout: 1200 });
    const t = idle === undefined ? window.setTimeout(arrancar, 400) : undefined;

    return () => {
      cancelado = true;
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (t !== undefined) clearTimeout(t);
    };
  }, []);

  return null;
}
