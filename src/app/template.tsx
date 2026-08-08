import type { ReactNode } from "react";

/**
 * Transición sutil de entrada en cada navegación de ruta.
 *
 * SERVER COMPONENT: cero JavaScript. Antes esto era `motion` y, al vivir en el
 * template raíz, arrastraba la librería de animación entera a TODAS las páginas
 * del sitio — la importación más cara posible, para un desvanecido.
 *
 * Ahora es una animación CSS sobre opacity y transform, que arranca sola al
 * montarse el nodo. En el panel y la administración se anula por CSS (ver
 * `.entrada-ruta:has([data-zona-trabajo])` en globals.css): ahí la espera es
 * lentitud autoinfligida, no elegancia.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="entrada-ruta">{children}</div>;
}
