import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicacionShell } from "@/components/campus/PublicacionShell";
import { ShareButtons } from "@/components/campus/ShareButtons";
import { TrackRead } from "@/components/campus/TrackRead";
import { ClickCount } from "@/components/campus/ClickCount";
import { isActiveNow, fechaLarga } from "@/lib/schedule";
import { cargarNoticia, rutaNoticia, urlAbsoluta, recorte } from "@/lib/publicaciones";

export const revalidate = 60;

// Vacío a propósito: cada noticia se genera en la primera visita y queda
// cacheada 60 segundos. El porqué está explicado en la página de oportunidad.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ university: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university, id } = await params;
  const datos = await cargarNoticia(university, id);
  if (!datos) return { title: "Noticia no encontrada" };

  const { uni, item } = datos;
  const vigente = isActiveNow(item.starts_at, item.ends_at);
  const titulo = `${item.title} — ${uni.short_name || uni.name}`;
  const descripcion = recorte(item.summary || item.body);
  const url = urlAbsoluta(rutaNoticia(uni.slug, item.id));

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    robots: vigente ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      title: titulo,
      description: descripcion,
      url,
      siteName: "Cursemos Ingeniería",
      locale: "es_AR",
      publishedTime: item.published_at ?? undefined,
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  };
}

export default async function NoticiaPage({ params }: Props) {
  const { university, id } = await params;
  const datos = await cargarNoticia(university, id);
  if (!datos) notFound();

  const { uni, item } = datos;
  const vigente = isActiveNow(item.starts_at, item.ends_at);
  const url = urlAbsoluta(rutaNoticia(uni.slug, item.id));

  return (
    <PublicacionShell
      uni={uni}
      eyebrow="Noticia"
      titulo={item.title}
      meta={item.published_at ? fechaLarga(item.published_at) : null}
      caducada={vigente ? null : item.ends_at}
    >
      <TrackRead kind="news" id={item.id} />

      {item.summary && <p className="mt-6 text-lg leading-relaxed text-ink-soft">{item.summary}</p>}
      {item.body && (
        <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">{item.body}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-6">
        <ClickCount kind="news" id={item.id} clicks={item.clicks} />
        <ShareButtons url={url} titulo={item.title} />
      </div>
    </PublicacionShell>
  );
}
