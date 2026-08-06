import type { ReactNode } from "react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { GlobalNet } from "@/components/campus/GlobalNet";
import { CampusCrumb } from "@/components/campus/CampusCrumb";
import { AmbassadorCard, type AmbassadorCardData } from "@/components/campus/AmbassadorCard";
import { TrackedLink } from "@/components/campus/TrackedLink";
import { TrackedNews } from "@/components/campus/TrackedNews";
import { scheduleState, type ScheduleTone } from "@/lib/schedule";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

const KIND_LABEL: Record<string, string> = {
  beca: "Beca",
  pasantia: "Pasantía",
  programa: "Programa",
  evento: "Evento",
  competencia: "Competencia",
  noticia: "Noticia",
};
const MODALITY_LABEL: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  ambas: "Presencial y virtual",
};

const TONE: Record<ScheduleTone, string> = {
  emerald:
    "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-emerald-300",
  amber:
    "rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-amber-300",
  red: "rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-red-300",
  muted:
    "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-ink-mute",
};

export type CampusUni = { name: string; short_name: string | null; city: string | null; slug: string };
export type CampusNews = {
  id: string; title: string; summary: string | null; body?: string | null;
  status?: string; starts_at?: string | null; ends_at?: string | null; clicks?: number | null;
};
export type CampusOpp = {
  id: string; kind: string; title: string; org: string | null;
  description: string | null; deadline: string | null; requirements: string[] | null; href: string | null;
  status?: string; starts_at?: string | null; ends_at?: string | null; clicks?: number | null;
};
export type CampusProf = {
  id: string; name: string; title: string | null; modality: string;
  subjects: string[] | null; whatsapp: string | null; status?: string; clicks?: number | null;
};
export type CampusDrive = {
  id: string; owner: string; career: string | null; href: string | null;
  status?: string; clicks?: number | null;
};

/** Recuento de clics acumulado de una publicación. */
function ClickCount({ clicks }: { clicks?: number | null }) {
  const n = clicks ?? 0;
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-mute"
      title={`${n} ${n === 1 ? "clic" : "clics"} en total`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden>
        <path d="M9 11.5V5a1.5 1.5 0 0 1 3 0v6" />
        <path d="M12 11V4.5a1.5 1.5 0 0 1 3 0V11" />
        <path d="M15 11V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.2-3l-2-3.4a1.5 1.5 0 0 1 2.6-1.5L9 14" />
      </svg>
      {n} {n === 1 ? "clic" : "clics"}
    </span>
  );
}

function waLink(num: string | null, name?: string | null): string | null {
  if (!num) return null;
  const digits = num.replace(/\D/g, "");
  if (!digits) return null;
  const saludo = name ? `Hola ${name}` : "Hola";
  const msg =
    `${saludo}, te escribo desde Cursemos Ingeniería. ` +
    "Me gustaría pedirte información sobre tus clases particulares. ¡Gracias!";
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

/** Badge de estado para la vista previa (no se muestra en la página pública real). */
function StateBadge({
  preview,
  status,
  starts_at,
  ends_at,
}: {
  preview: boolean;
  status?: string;
  starts_at?: string | null;
  ends_at?: string | null;
}) {
  if (!preview) return null;
  const s = scheduleState(status ?? "published", starts_at ?? null, ends_at ?? null);
  if (s.tone === "emerald") return null; // en vivo: se ve igual que en público
  return <span className={TONE[s.tone]}>{s.label}</span>;
}

function Head({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="eyebrow flex items-center gap-3">
        <span className="metal-tick" />
        {eyebrow}
      </span>
      <h2 className="font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight text-ink">
        {title}
      </h2>
      {lead && <p className="max-w-2xl leading-relaxed text-ink-soft">{lead}</p>}
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <section className="mt-20 flex flex-col gap-8 sm:mt-24">{children}</section>;
}

/**
 * Render completo del campus de una universidad. Lo usan la página pública
 * (solo contenido en vivo) y la vista previa del embajador (todo, con badges).
 */
export function CampusView({
  uni,
  news,
  opportunities,
  professors,
  drives,
  ambassador,
  preview = false,
}: {
  uni: CampusUni;
  news: CampusNews[];
  opportunities: CampusOpp[];
  professors: CampusProf[];
  drives: CampusDrive[];
  ambassador: AmbassadorCardData | null;
  preview?: boolean;
}) {
  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <GlobalNet />

        <div className="shell relative z-10 pt-32 pb-24 sm:pt-40">
          <Reveal>
            <CampusCrumb items={[{ label: "Campus", href: "/campus" }, { label: uni.short_name || uni.name }]} />
          </Reveal>

          <div className="mt-6 flex flex-col gap-3">
            <Reveal delay={0.05}>
              <h1 className="font-display text-[length:var(--text-h1)] font-bold leading-[0.95] tracking-tight text-ink">
                {uni.name}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
                Facultad de Ingeniería{uni.city ? ` · ${uni.city}` : ""}
              </p>
            </Reveal>
          </div>

          {/* Embajador */}
          {ambassador && (
            <section className="mt-16 sm:mt-20">
              <Reveal>
                <AmbassadorCard data={ambassador} />
              </Reveal>
            </section>
          )}

          {/* Novedades */}
          <Section>
            <Reveal>
              <Head eyebrow="Novedades" title="Noticias y oportunidades" />
            </Reveal>
            <div className="flex flex-col gap-4">
              {news.length === 0 && opportunities.length === 0 && (
                <p className="text-sm text-ink-mute">Todavía no hay publicaciones.</p>
              )}
              {news.map((n) => (
                <Reveal key={n.id}>
                  <TrackedNews
                    id={n.id}
                    title={n.title}
                    summary={n.summary}
                    body={n.body ?? null}
                    track={!preview}
                    badge={
                      <StateBadge preview={preview} status={n.status} starts_at={n.starts_at} ends_at={n.ends_at} />
                    }
                    footer={<ClickCount clicks={n.clicks} />}
                  />
                </Reveal>
              ))}
              {opportunities.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {opportunities.map((o) => (
                    <Reveal key={o.id}>
                      <article className="chrome-edge flex h-full flex-col gap-4 rounded-3xl border border-hair-strong p-6 lift" style={{ background: CARD }}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-blue-300">
                            {KIND_LABEL[o.kind] ?? o.kind}
                          </span>
                          {o.deadline && (
                            <span className="rounded-full border border-hair px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-mute">
                              {o.deadline}
                            </span>
                          )}
                          <StateBadge preview={preview} status={o.status} starts_at={o.starts_at} ends_at={o.ends_at} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-semibold leading-snug text-ink">{o.title}</h3>
                          {o.org && <p className="mt-1 text-sm font-medium text-ti-500">{o.org}</p>}
                          {o.description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{o.description}</p>}
                        </div>
                        {o.requirements && o.requirements.length > 0 && (
                          <div className="border-t border-hair pt-4">
                            <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-mute">
                              Requisitos excluyentes
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {o.requirements.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm leading-snug text-ink-soft">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-auto flex flex-col gap-3">
                          {o.href && (
                            <TrackedLink kind="opportunities" id={o.id} href={o.href} track={!preview} className="btn btn-blue w-full text-sm">
                              Ver convocatoria
                            </TrackedLink>
                          )}
                          <ClickCount clicks={o.clicks} />
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Profesores */}
          <Section>
            <Reveal>
              <Head eyebrow="Acompañamiento" title="Alianzas académicas" lead="Profesores particulares, tutorías y mentorías." />
            </Reveal>
            <div className="flex flex-col gap-3">
              {professors.length === 0 ? (
                <p className="text-sm text-ink-mute">Todavía no hay profesores publicados.</p>
              ) : (
                professors.map((p) => {
                  const wa = waLink(p.whatsapp, p.name);
                  return (
                    <Reveal key={p.id}>
                      <article className="chrome-edge flex flex-col gap-4 rounded-3xl border border-hair-strong p-6 sm:flex-row sm:items-center sm:justify-between" style={{ background: CARD }}>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-blue-300">
                              {MODALITY_LABEL[p.modality] ?? p.modality}
                            </span>
                            <StateBadge preview={preview} status={p.status} />
                          </div>
                          <h3 className="mt-2 font-display text-xl font-semibold text-ink">{p.name}</h3>
                          {p.title && <p className="text-sm text-ti-500">{p.title}</p>}
                          {p.subjects && p.subjects.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {p.subjects.map((s, i) => (
                                <span key={i} className="rounded-full border border-hair px-2.5 py-0.5 text-xs text-ink-soft">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-3">
                            <ClickCount clicks={p.clicks} />
                          </div>
                        </div>
                        {wa && (
                          <TrackedLink kind="professors" id={p.id} href={wa} track={!preview} className="btn btn-blue shrink-0 self-start text-sm sm:self-auto">
                            Enviar WhatsApp
                          </TrackedLink>
                        )}
                      </article>
                    </Reveal>
                  );
                })
              )}
            </div>
          </Section>

          {/* Drives */}
          <Section>
            <Reveal>
              <Head
                eyebrow="Material colaborativo"
                title="Recursos de estudio"
                lead={`Drives compartidos por estudiantes de la ${uni.name}.`}
              />
            </Reveal>
            <div className="flex flex-col gap-3">
              {drives.length === 0 ? (
                <p className="text-sm text-ink-mute">Todavía no hay drives publicados.</p>
              ) : (
                drives.map((d) => (
                  <Reveal key={d.id}>
                    <div className="chrome-edge flex flex-col gap-4 rounded-2xl border border-hair-strong p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" style={{ background: CARD }}>
                      <div>
                        <StateBadge preview={preview} status={d.status} />
                        <h4 className="mt-1 font-display text-lg font-semibold text-ink">Drive de {d.owner}</h4>
                        {d.career && (
                          <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.12em] text-ti-500">{d.career}</p>
                        )}
                        <div className="mt-2">
                          <ClickCount clicks={d.clicks} />
                        </div>
                      </div>
                      {d.href && (
                        <TrackedLink kind="drives" id={d.id} href={d.href} track={!preview} className="btn btn-blue shrink-0 self-start text-sm sm:self-auto">
                          Acceder
                        </TrackedLink>
                      )}
                    </div>
                  </Reveal>
                ))
              )}
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
