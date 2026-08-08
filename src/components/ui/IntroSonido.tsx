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
    const gestos = ["pointerdown", "keydown", "touchstart"] as const;

    const arrancar = () => {
      gestos.forEach((g) => window.removeEventListener(g, arrancar));
      if (cancelado) return;
      // Import diferido: el sintetizador no forma parte del arranque.
      import("@/lib/cue").then((m) => !cancelado && m.armarGolpe());
    };

    // Solo al primer gesto. Los navegadores bloquean el audio hasta que la
    // persona toca algo, así que cargarlo antes es trabajo garantizado en
    // vano. Medido: armar el contexto de audio y generar el buffer de ruido
    // costaba una tarea de 457 ms en celular, en plena carga de la página.
    gestos.forEach((g) => window.addEventListener(g, arrancar, { once: true, passive: true }));

    return () => {
      cancelado = true;
      gestos.forEach((g) => window.removeEventListener(g, arrancar));
    };
  }, []);

  return null;
}
