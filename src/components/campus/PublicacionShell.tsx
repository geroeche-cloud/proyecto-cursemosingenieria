import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { fechaLarga } from "@/lib/schedule";
import type { UniMin } from "@/lib/publicaciones";

/**
 * Marco de la página propia de una publicación.
 *
 * Estas páginas son el destino de un enlace compartido: casi siempre se abren
 * en un celular, desde WhatsApp, con la paciencia de quien está mirando el
 * teléfono en un pasillo. Por eso son sobrias y livianas — texto, una acción y
 * una salida al campus— y no llevan el fondo animado de la portada: ahí adorna,
 * acá solo retrasa lo único que la persona vino a leer (ver regla 8 de
 * RENDIMIENTO.md).
 */
export function PublicacionShell({
  uni,
  eyebrow,
  titulo,
  meta,
  caducada,
  children,
}: {
  uni: UniMin;
  eyebrow: string;
  titulo: string;
  /** Línea de contexto bajo el título (organización, fecha…). */
  meta?: ReactNode;
  /** Fecha de cierre, si ya pasó. */
  caducada?: string | null;
  children: ReactNode;
}) {
  const nombreUni = uni.short_name || uni.name;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-32 pb-24 text-ink sm:pt-40">
        <Link
          href={`/campus/${uni.slug}`}
          className="font-mono text-xs uppercase tracking-[0.16em] text-blue-300 transition-colors hover:text-blue-200"
        >
          ← {nombreUni}
        </Link>

        {/*
          El aviso va ARRIBA del título y no abajo. Alguien que abre un enlace
          reenviado semanas después necesita saber que ya cerró antes de leerse
          los requisitos y entusiasmarse. Antes ese enlace simplemente lo dejaba
          en una lista donde la publicación ya no estaba, sin ninguna
          explicación: parecía que el sitio estaba roto.
        */}
        {caducada && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-amber-300">
              Ya cerró
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Esta publicación estuvo vigente hasta el {fechaLarga(caducada)}. La dejamos visible
              porque el enlace sigue circulando, pero ya no se puede participar.{" "}
              <Link href={`/campus/${uni.slug}`} className="text-blue-300 underline">
                Mirá lo que hay abierto en {nombreUni}
              </Link>
              .
            </p>
          </div>
        )}

        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-blue-300">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {titulo}
        </h1>
        {meta && <div className="mt-3 text-sm text-ink-mute">{meta}</div>}

        {children}

        <div className="mt-12 border-t border-hair pt-6">
          <Link href={`/campus/${uni.slug}`} className="btn btn-ghost text-sm">
            Ver todo el campus de {nombreUni}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
