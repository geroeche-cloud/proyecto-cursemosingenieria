import Image from "next/image";
import { memo } from "react";
import {
  MODALITY_LABEL,
  buildWhatsappUrl,
  getProfessorSubjects,
  type Professor,
} from "@/lib/academy";

/** Ícono de WhatsApp (logo oficial, monocromo, sin dependencias externas). */
function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Ícono de "ingreso" para la materia destacada (entrar a la facultad). */
function EntranceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

/**
 * Avatar cuadrado. Usa la foto SOLO si es una ruta local (`/...`) — nunca carga
 * URLs remotas arbitrarias. Sin foto válida → iniciales sobre superficie metálica.
 */
function Avatar({ professor }: { professor: Professor }) {
  const photo = professor.photo;
  const isLocalPhoto = typeof photo === "string" && photo.startsWith("/");
  const initials = professor.name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl border border-hair-strong sm:w-28">
      {isLocalPhoto && photo ? (
        <Image src={photo} alt={professor.name} fill sizes="112px" className="object-cover" />
      ) : (
        <div className="metal-fill flex h-full w-full items-center justify-center">
          <span className="font-display text-2xl font-bold text-[#0d1016]">{initials}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Tarjeta horizontal del profesor: foto cuadrada a la izquierda; nombre, título,
 * modalidad, materias y botón "Escribime" (abre WhatsApp) a la derecha.
 */
function ProfessorCardBase({ professor }: { professor: Professor }) {
  const wa = buildWhatsappUrl(professor.whatsapp);
  const subjects = getProfessorSubjects(professor.id);

  return (
    <article
      className="glass-lux chrome-edge flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center sm:p-6"
      style={{ background: "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)" }}
    >
      <Avatar professor={professor} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h4 className="font-display text-xl font-semibold text-ink">{professor.name}</h4>
          <p className="mt-0.5 text-sm text-ti-500">{professor.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip rounded-full px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ti-100">
            {MODALITY_LABEL[professor.modality]}
          </span>
          {subjects.map((s) =>
            s.highlight ? (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/50 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200 shadow-[0_0_18px_-5px_rgba(59,107,255,0.6)]"
              >
                <EntranceIcon />
                {s.name}
              </span>
            ) : (
              <span
                key={s.id}
                className="rounded-full border border-hair px-3 py-1 text-xs text-ink-soft"
              >
                {s.name}
              </span>
            )
          )}
        </div>
      </div>

      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-blue w-full shrink-0 text-sm sm:w-auto"
          aria-label={`Escribir por WhatsApp a ${professor.name}`}
        >
          <WhatsappIcon />
          Escribime
        </a>
      ) : (
        <span className="btn btn-ghost w-full shrink-0 cursor-not-allowed text-sm opacity-50 sm:w-auto">
          Contacto no disponible
        </span>
      )}
    </article>
  );
}

/** Presentacional y puro → memoizado para evitar renders innecesarios. */
export const ProfessorCard = memo(ProfessorCardBase);
