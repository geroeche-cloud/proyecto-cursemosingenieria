import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicacionShell } from "@/components/campus/PublicacionShell";
import { ShareButtons } from "@/components/campus/ShareButtons";
import { TrackedLink } from "@/components/campus/TrackedLink";
import { TrackRead } from "@/components/campus/TrackRead";
import { ClickCount } from "@/components/campus/ClickCount";
import { isActiveNow } from "@/lib/schedule";
import {
  cargarOportunidad,
  rutaOportunidad,
  urlAbsoluta,
  recorte,
  KIND_LABEL,
} from "@/lib/publicaciones";

export const revalidate = 60;

/**
 * Página propia de una convocatoria.
 *
 * `generateStaticParams` devuelve vacío A PROPÓSITO. Las publicaciones se
 * cuentan por miles y cambian todos los días: generarlas todas en cada
 * despliegue haría el build lento, y buena parte del trabajo sería para
 * páginas que nadie va a abrir. Con la lista vacía, cada una se genera la
 * primera vez que alguien la visita y queda cacheada 60 segundos, igual que
 * el resto del campus. (Sin esta función, la documentación es explícita: la
 * página se renderizaría entera EN CADA VISITA, y un enlace que se vuelve
 * viral pegaría en la base una vez por persona.)
 */
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ university: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university, id } = await params;
  const datos = await cargarOportunidad(university, id);
  if (!datos) return { title: "Convocatoria no encontrada" };

  const { uni, item } = datos;
  const tipo = KIND_LABEL[item.kind] ?? item.kind;
  const vigente = isActiveNow(item.starts_at, item.ends_at);

  // El título de la vista previa es lo único que se lee en un grupo de
  // WhatsApp antes de decidir si tocar. Lleva el tipo, el nombre y de quién es
  // — no "Cursemos Ingeniería", que no le dice nada a nadie.
  const titulo = `${tipo}: ${item.title}${item.org ? ` — ${item.org}` : ""}`;
  const descripcion = recorte(
    item.description ||
      `${tipo} para estudiantes de ingeniería de ${uni.name}.` +
        (item.deadline ? ` Cierra: ${item.deadline}.` : ""),
  );
  const url = urlAbsoluta(rutaOportunidad(uni.slug, item.id));

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    // Una convocatoria vencida se deja accesible para quien tenga el enlace,
    // pero se le pide a Google que no la ofrezca: mandar a alguien a algo que
    // ya cerró es peor que no aparecer.
    robots: vigente ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      title: titulo,
      description: descripcion,
      url,
      siteName: "Cursemos Ingeniería",
      locale: "es_AR",
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  };
}

export default async function OportunidadPage({ params }: Props) {
  const { university, id } = await params;
  const datos = await cargarOportunidad(university, id);
  if (!datos) notFound();

  const { uni, item } = datos;
  const vigente = isActiveNow(item.starts_at, item.ends_at);
  const tipo = KIND_LABEL[item.kind] ?? item.kind;
  const url = urlAbsoluta(rutaOportunidad(uni.slug, item.id));

  return (
    <PublicacionShell
      uni={uni}
      eyebrow={tipo}
      titulo={item.title}
      meta={item.org}
      caducada={vigente ? null : item.ends_at}
    >
      <TrackRead kind="opportunities" id={item.id} />

      {item.description && (
        <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">{item.description}</p>
      )}

      {/* `deadline` es texto libre a propósito: los embajadores escriben cosas
          como "hasta cubrir los cupos" o "fines de marzo". Se muestra tal cual. */}
      {item.deadline && (
        <p className="mt-6 rounded-2xl border border-hair bg-white/[0.02] px-4 py-3 text-sm">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-mute">
            Cierre
          </span>
          <br />
          <span className="text-ink">{item.deadline}</span>
        </p>
      )}

      {item.requirements && item.requirements.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold">Requisitos</h2>
          <ul className="mt-3 ml-5 list-disc space-y-2 leading-relaxed text-ink-soft">
            {item.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {item.href && vigente && (
        <div className="mt-8">
          <TrackedLink
            kind="opportunities"
            id={item.id}
            href={item.href}
            className="btn btn-blue text-sm"
          >
            Ver convocatoria
          </TrackedLink>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-6">
        <ClickCount kind="opportunities" id={item.id} clicks={item.clicks} />
        <ShareButtons url={url} titulo={item.title} />
      </div>
    </PublicacionShell>
  );
}
