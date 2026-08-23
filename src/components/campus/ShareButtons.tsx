"use client";

import { useState } from "react";

type Props = {
  /**
   * Dirección completa y propia de la publicación, armada en el servidor.
   *
   * Antes acá llegaba la página de la universidad más un ancla (`#pub-<id>`).
   * Saltaba al lugar correcto, pero el que recibía el mensaje veía la vista
   * previa del sitio entero —sin título ni descripción— y Google no podía
   * mostrar la publicación por su cuenta, porque un ancla no es una dirección
   * distinta. Ahora cada publicación tiene la suya.
   */
  url: string;
  /** Texto que acompaña al enlace al compartir. */
  titulo: string;
};

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23a8.18 8.18 0 0 1 5.82 2.41 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.65c0-1.35-.03-3.08-1.9-3.08-1.9 0-2.19 1.46-2.19 2.98V21h-4V9Z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </svg>
  );
}

function IconCompartir() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

const boton =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-hair text-ink-mute transition-colors hover:border-blue-500/50 hover:text-blue-200";

/**
 * Compartir una publicación. Cada una tiene su propia página, así el que lo
 * recibe cae directo en ella y ve de qué se trata antes de tocar.
 *
 * Instagram no permite compartir enlaces desde la web (no existe una URL para
 * eso). Por eso en celular se ofrece el menú nativo —que sí incluye Instagram,
 * historias y cualquier app instalada— y en escritorio, copiar el enlace.
 */
export function ShareButtons({ url, titulo }: Props) {
  const [copiado, setCopiado] = useState(false);

  const texto = `${titulo} — vía Cursemos Ingeniería`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  /** Menú nativo del celular (incluye Instagram); si no existe, copia. */
  const compartirNativo = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url });
      } catch {
        // el usuario canceló: no es un error
      }
      return;
    }
    await copiar();
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-faint">
        Compartir
      </span>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${texto}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir por WhatsApp"
        title="WhatsApp"
        className={boton}
      >
        <IconWhatsApp />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en LinkedIn"
        title="LinkedIn"
        className={boton}
      >
        <IconLinkedIn />
      </a>

      <button
        type="button"
        onClick={compartirNativo}
        aria-label="Compartir en Instagram u otra app"
        title="Instagram y otras apps"
        className={boton}
      >
        <IconCompartir />
      </button>

      <button
        type="button"
        onClick={copiar}
        aria-label="Copiar enlace"
        title={copiado ? "¡Enlace copiado!" : "Copiar enlace"}
        className={`${boton} ${copiado ? "border-emerald-500/50 text-emerald-300" : ""}`}
      >
        {copiado ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <path d="m5 13 4 4L19 7" />
          </svg>
        ) : (
          <IconLink />
        )}
      </button>

      {copiado && (
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300">
          Copiado
        </span>
      )}
    </div>
  );
}
