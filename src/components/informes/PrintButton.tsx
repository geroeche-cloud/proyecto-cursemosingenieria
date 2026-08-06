"use client";

/** Abre el diálogo de impresión: ahí se elige "Guardar como PDF". */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 print:hidden"
    >
      Descargar PDF
    </button>
  );
}
