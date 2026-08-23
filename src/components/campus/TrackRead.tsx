"use client";

import { useEffect } from "react";
import { trackClick, type ClickKind } from "./TrackedLink";

/**
 * Cuenta la lectura de una publicación al abrir su página. No dibuja nada.
 *
 * Antes el clic de una noticia se contaba al desplegar "Leer más" dentro del
 * campus. Eso dejaba fuera justo lo que más importa medir: al que llegó desde
 * un enlace compartido por WhatsApp, que abría la noticia directamente y no
 * aparecía en ningún informe.
 *
 * `trackClick` ya deduplica por sesión, y la base además por visitante y día:
 * recargar la página diez veces sigue contando una sola lectura.
 */
export function TrackRead({ kind, id }: { kind: ClickKind; id: string }) {
  useEffect(() => {
    trackClick(kind, id);
  }, [kind, id]);

  return null;
}
