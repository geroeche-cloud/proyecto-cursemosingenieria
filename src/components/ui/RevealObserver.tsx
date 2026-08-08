"use client";

import { useEffect } from "react";

/**
 * Único JavaScript detrás de todas las apariciones al hacer scroll del sitio.
 *
 * Se monta una sola vez por página y observa cada `[data-reveal]`, sin importar
 * cuántos haya. Reemplaza a la librería de animación completa que antes venía
 * incluida por cada elemento que aparecía.
 *
 * Deja de observar apenas un elemento apareció: nada queda corriendo de fondo.
 */
export function RevealObserver() {
  useEffect(() => {
    const elementos = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.visible)");
    if (elementos.length === 0) return;

    // Sin soporte o con movimiento reducido: se muestra todo de una.
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido || typeof IntersectionObserver === "undefined") {
      elementos.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: "-80px" },
    );

    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  });

  return null;
}
