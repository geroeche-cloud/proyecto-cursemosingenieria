import Link from "next/link";
import type { ReactNode } from "react";
import { ShareButtons } from "./ShareButtons";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

/**
 * Tarjeta de noticia dentro del campus de una universidad.
 *
 * ANTES ERA UN ACORDEÓN, Y AHORA ES UN ENLACE. El cambio no es estético:
 *
 * · "Leer más" desplegaba el texto en el lugar. Cómodo, pero el contenido no
 *   tenía dirección propia: Google no podía mostrar esa noticia sola y quien la
 *   compartía mandaba a una lista, no a la noticia.
 * · Como enlace, además, Google puede llegar caminando desde el campus hasta
 *   cada noticia. Un mapa del sitio ayuda, pero los enlaces reales son lo que
 *   de verdad se recorre.
 * · Y de paso deja de necesitar JavaScript: era un componente cliente por un
 *   `useState` para abrir y cerrar. Ahora es servidor y no envía nada
 *   (ver regla 1 de RENDIMIENTO.md).
 *
 * El clic ya no se cuenta acá sino al abrir la noticia, que es cuando alguien
 * la leyó de verdad — y así también cuentan las visitas que llegan de un
 * enlace compartido, que antes no aparecían en ningún informe.
 *
 * En la vista previa del embajador no hay páginas propias para los borradores,
 * así que ahí el texto se muestra entero en la tarjeta.
 */
export function NoticiaCard({
  id,
  title,
  summary,
  body,
  href,
  url,
  preview = false,
  badge,
  footer,
}: {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  /** Dirección interna de la noticia (no se usa en la vista previa). */
  href: string;
  /** Dirección pública completa, para compartir. */
  url: string;
  preview?: boolean;
  badge?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article
      // El ancla `pub-<id>` se conserva aunque ya no se comparta: los enlaces
      // repartidos antes de este cambio la traen, y tienen que seguir cayendo
      // en la publicación correcta.
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

      <h3 className="mt-2 font-display text-xl font-semibold text-ink">
        {preview ? (
          title
        ) : (
          // El título entero es el área tocable, no solo las dos palabras de
          // "Leer más": en un celular es la diferencia entre tocar y apuntar.
          <Link href={href} className="transition-colors hover:text-white">
            {title}
          </Link>
        )}
      </h3>

      {summary && <p className="mt-1 leading-relaxed text-ink-soft">{summary}</p>}

      {body && preview && (
        <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{body}</p>
      )}

      {body && !preview && (
        <Link
          href={href}
          className="mt-3 inline-block text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
        >
          Leer la noticia
        </Link>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {footer}
        <ShareButtons url={url} titulo={title} />
      </div>
    </article>
  );
}
