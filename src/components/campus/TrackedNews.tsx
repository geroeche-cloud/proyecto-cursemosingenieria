"use client";

import { useState, type ReactNode } from "react";
import { trackClick } from "./TrackedLink";
import { ShareButtons } from "./ShareButtons";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

/**
 * Tarjeta de noticia con "Leer más": al desplegar el contenido registra un clic
 * (una vez por sesión). En modo vista previa no cuenta.
 */
export function TrackedNews({
  id,
  title,
  summary,
  body,
  track = true,
  badge,
  footer,
  baseUrl,
}: {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  track?: boolean;
  badge?: ReactNode;
  footer?: ReactNode;
  baseUrl: string;
}) {
  const [open, setOpen] = useState(false);

  const onToggle = () => {
    if (!open && track) trackClick("news", id);
    setOpen((o) => !o);
  };

  return (
    <article
      id={`pub-${id}`}
      className="chrome-edge scroll-mt-28 rounded-2xl border border-hair-strong p-6"
      style={{ background: CARD }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute">
          Noticia
        </span>
        {badge}
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold text-ink">{title}</h3>
      {summary && <p className="mt-1 leading-relaxed text-ink-soft">{summary}</p>}

      {body && (
        <>
          {open && (
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{body}</p>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="mt-3 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
          >
            {open ? "Ver menos" : "Leer más"}
          </button>
        </>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {footer}
        <ShareButtons baseUrl={baseUrl} anchor={`pub-${id}`} titulo={title} />
      </div>
    </article>
  );
}
