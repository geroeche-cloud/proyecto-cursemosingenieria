"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Único JavaScript detrás de todas las apariciones al hacer scroll del sitio.
 *
 * Los elementos llegan del servidor con `opacity: 0` y se vuelven visibles
 * cuando este observador les pone la clase. Eso significa que si el observador
 * NO corre, el contenido queda invisible para siempre — el peor modo de falla
 * posible, porque la página se ve vacía sin ningún error.
 *
 * Eso pasó en producción: este componente vive en el layout raíz, y el layout
 * NO se vuelve a renderizar al navegar entre páginas. El efecto corría una sola
 * vez, al cargar la primera página. Al pasar de la portada al Campus, el
 * contenido nuevo nunca era observado y quedaba en opacidad cero. Se veía el
 * fondo animado —que es otro componente, y sí se monta— sobre una página vacía.
 *
 * Ahora hay tres capas, en orden de preferencia:
 *   1. Se vuelve a barrer en cada cambio de ruta (usePathname como dependencia).
 *   2. Se vigila el DOM: cualquier elemento que aparezca después queda cubierto.
 *   3. Red de seguridad: pase lo que pase, a los 3 segundos se muestra todo.
 *
 * La tercera es la importante. Las otras dos pueden fallar por algo que hoy no
 * previmos; la red de seguridad garantiza que el contenido NUNCA quede
 * escondido. Que una animación no se vea es un detalle estético; que la página
 * se vea vacía es que el sitio no funciona.
 */
export function RevealObserver() {
  const ruta = usePathname();

  useEffect(() => {
    const mostrar = (el: Element) => el.classList.add("visible");
    const pendientes = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.visible)");

    // Sin soporte o con movimiento reducido: se muestra todo de una.
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido || typeof IntersectionObserver === "undefined") {
      pendientes().forEach(mostrar);
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          mostrar(entrada.target);
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: "-80px" },
    );

    const barrer = () => pendientes().forEach((el) => observador.observe(el));
    barrer();

    // Contenido que aparece después (cambio de pestaña, carga diferida).
    const vigia = new MutationObserver(barrer);
    vigia.observe(document.body, { childList: true, subtree: true });

    // Red de seguridad. Si algo salió mal, el contenido se muestra igual.
    const rescate = window.setTimeout(() => pendientes().forEach(mostrar), 3000);

    return () => {
      observador.disconnect();
      vigia.disconnect();
      clearTimeout(rescate);
    };
  }, [ruta]);

  return null;
}
