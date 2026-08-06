"use client";

import type { ReactNode } from "react";

/**
 * Botón de submit que pide confirmación antes de disparar la acción del form.
 * Se usa para acciones destructivas (borrar) dentro de <form action={serverAction}>.
 */
export function ConfirmButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
