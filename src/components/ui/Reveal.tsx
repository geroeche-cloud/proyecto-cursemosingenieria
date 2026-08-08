import type { ReactNode } from "react";

/**
 * Aparición al hacer scroll. SERVER COMPONENT: no envía nada de JavaScript.
 *
 * Antes esto era un componente de `motion`. Cada aparición traía la librería
 * entera al navegador —cientos de kilobytes— para hacer un desvanecido con un
 * desplazamiento, que es literalmente lo que una transición CSS hace nativa y
 * gratis, en el compositor, sin ocupar el hilo principal.
 *
 * El único JavaScript involucrado es un observador de 30 líneas que se monta
 * UNA vez por página (RevealObserver) y le pone la clase a todos.
 *
 * Se anima solo opacity y transform: las dos propiedades que el navegador
 * resuelve en la GPU sin rehacer el layout ni repintar.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Retraso en segundos, para escalonar elementos de una misma fila. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
