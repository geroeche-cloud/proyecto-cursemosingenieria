import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { MetalDivider } from "@/components/ui/MetalDivider";
import { GlobalNet } from "@/components/campus/GlobalNet";
import { FOUNDER, PROFILE_PROJECTS, VALUES, RECORRIDO } from "@/lib/founder";
import { getProject } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Gerónimo Echevarría — Fundador y Embajador",
  description:
    "La trayectoria de Gerónimo Echevarría: fundador de Cursemos Ingeniería y embajador de la Universidad Nacional del Comahue. Visión, proyectos, recorrido y valores.",
};

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Pasaje de lectura (cuerpo del manifiesto). */
function Passage({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <p className="max-w-3xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">{children}</p>
    </Reveal>
  );
}

/** Cierre destacado — dos líneas metálicas con acento lateral. */
function Couplet({ a, b, shimmer = false }: { a: string; b: string; shimmer?: boolean }) {
  return (
    <Reveal>
      <div className="max-w-3xl border-l-2 border-blue-500/50 pl-5 sm:pl-6">
        <p className="font-display text-xl font-semibold leading-snug text-ti-500 sm:text-2xl">{a}</p>
        <p
          className={`mt-1 font-display text-xl font-bold leading-snug text-ti sm:text-2xl ${
            shimmer ? "animate-shimmer" : ""
          }`}
        >
          {b}
        </p>
      </div>
    </Reveal>
  );
}

/** Encabezado de sección: epígrafe metálico + título + bajada opcional. */
function Head({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Reveal>
        <span className="eyebrow flex items-center gap-3">
          <span className="metal-tick" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight text-ink">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}

export default function EmbajadoresPage() {
  const contact = `mailto:${FOUNDER.email}?subject=${encodeURIComponent("Contacto — Gerónimo Echevarría, Cursemos Ingeniería")}`;
  const projects = PROFILE_PROJECTS.map((pp) => ({ project: getProject(pp.slug), impact: pp.impact })).filter(
    (x): x is { project: NonNullable<ReturnType<typeof getProject>>; impact: string } => Boolean(x.project),
  );

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <GlobalNet />

        {/* ---------- Hero personal ---------- */}
        <section className="relative pt-32 pb-16 sm:pt-40">
          <div className="shell relative z-10">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.7fr] lg:gap-16">
              <div className="order-2 flex flex-col items-start gap-6 lg:order-1">
                <Reveal>
                  <span className="eyebrow flex items-center gap-3">
                    <span className="metal-tick" />
                    Perfil del embajador
                  </span>
                </Reveal>
                <Reveal delay={0.05}>
                  <h1 className="font-display text-[length:var(--text-h1)] font-bold leading-[0.98] tracking-tight text-ink">
                    {FOUNDER.name}
                  </h1>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-ti-500">
                    {FOUNDER.role} · {FOUNDER.ambassador}
                  </p>
                </Reveal>
                <Reveal delay={0.13}>
                  <p className="max-w-xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
                    {FOUNDER.bio}
                  </p>
                </Reveal>
                <Reveal delay={0.19}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a href={contact} className="btn btn-blue">
                      <MailIcon />
                      Contactar
                    </a>
                    {FOUNDER.socials.map((s) => {
                      const external = !s.href.startsWith("mailto");
                      return (
                        <a
                          key={s.label}
                          href={s.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="chip rounded-full px-3.5 py-1.5 text-sm font-medium text-ti-100 transition-colors hover:text-white"
                        >
                          {s.label}
                        </a>
                      );
                    })}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.1} className="order-1 lg:order-2">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[22rem] overflow-hidden rounded-[1.75rem] border border-hair-strong chrome-edge lg:mx-0 lg:ml-auto">
                  <Image
                    src={FOUNDER.photo}
                    alt={FOUNDER.name}
                    fill
                    sizes="(max-width: 1024px) 352px, 352px"
                    priority
                    className="object-cover object-[50%_16%]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/70 to-transparent" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <MetalDivider withMark />

        {/* ---------- Mi propósito ---------- */}
        <section className="relative py-24 sm:py-28">
          <div className="shell relative z-10">
            <div className="flex flex-col gap-6 sm:gap-7">
              <Reveal>
                <span className="eyebrow flex items-center gap-3">
                  <span className="metal-tick" />
                  Mi propósito
                </span>
              </Reveal>
              {FOUNDER.story.map((p) => (
                <Passage key={p.slice(0, 24)}>{p}</Passage>
              ))}
              <Couplet a={FOUNDER.storyClose.a} b={FOUNDER.storyClose.b} shimmer />
            </div>
          </div>
        </section>

        <MetalDivider />

        {/* ---------- Mi visión ---------- */}
        <section className="relative py-24 sm:py-28">
          <div className="shell relative z-10">
            <div className="flex flex-col gap-6 sm:gap-7">
              <Reveal>
                <span className="eyebrow flex items-center gap-3">
                  <span className="metal-tick" />
                  Mi visión
                </span>
              </Reveal>
              {FOUNDER.vision.map((p) => (
                <Passage key={p.slice(0, 24)}>{p}</Passage>
              ))}
              {FOUNDER.visionClose.map((c, i) => (
                <Couplet key={c.a} a={c.a} b={c.b} shimmer={i === 0} />
              ))}
            </div>
          </div>
        </section>

        <MetalDivider />

        {/* ---------- Mi recorrido ---------- */}
        <section className="relative py-24 sm:py-28">
          <div className="shell relative z-10">
            <Head
              eyebrow="Trayectoria"
              title="Mi recorrido"
              lead="Formación, experiencias y proyectos que marcaron mi camino hasta hoy."
            />

            <div className="relative ml-1 mt-16 border-l border-hair-strong">
              <div className="flex flex-col gap-16 pl-8 sm:pl-14">
                {RECORRIDO.map((g) => (
                  <Reveal key={`${g.year}-${g.phase}`}>
                    <div className="relative">
                      {/* Nodo + año grande */}
                      <span
                        className="absolute top-2 h-3.5 w-3.5 rounded-full bg-blue-400 ring-4 ring-[#05070e] -left-[calc(2rem+7px)] sm:-left-[calc(3.5rem+7px)]"
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-display text-4xl font-bold tracking-tight text-ti sm:text-5xl">
                          {g.year}
                        </span>
                        <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink-mute">
                          · {g.phase}
                        </span>
                      </div>

                      {/* Hitos: solo título + detalle corto */}
                      <div className="mt-7 flex flex-col gap-7">
                        {g.items.map((it) => (
                          <div key={it.title} className="relative">
                            <span
                              className="absolute top-2 h-2 w-2 rounded-full bg-ti-500 ring-4 ring-[#05070e] -left-[calc(2rem+6px)] sm:-left-[calc(3.5rem+6px)]"
                              aria-hidden
                            />
                            <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                              {it.title}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
                              {it.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MetalDivider />

        {/* ---------- Proyectos ---------- */}
        <section className="relative py-24 sm:py-28">
          <div className="shell relative z-10">
            <Head
              eyebrow="Proyectos"
              title="Lo que impulso"
              lead="Iniciativas que construyo para conectar a los estudiantes con el conocimiento, las oportunidades y la comunidad."
            />

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {projects.map(({ project: p, impact }, i) => (
                <Reveal key={p.slug} delay={0.05 * i}>
                  <article
                    className="chrome-edge flex h-full flex-col gap-5 rounded-3xl border border-hair-strong p-7 lift sm:p-8"
                    style={{ background: CARD }}
                  >
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                        {p.name}
                      </h3>
                      <p className="mt-1.5 text-sm font-medium text-ti-500">{p.tagline}</p>
                      <p className="mt-4 leading-relaxed text-ink-soft">{p.summary}</p>
                    </div>

                    <div className="mt-1 grid gap-4 border-t border-hair pt-5">
                      <div>
                        <p className="mb-1.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-mute">
                          Objetivo
                        </p>
                        <p className="text-sm leading-relaxed text-ink-soft">{p.objective}</p>
                      </div>
                      <div>
                        <p className="mb-1.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-mute">
                          Impacto buscado
                        </p>
                        <p className="text-sm leading-relaxed text-ink-soft">{impact}</p>
                      </div>
                    </div>

                    <Link
                      href={`/proyectos/${p.slug}`}
                      className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
                    >
                      Ver proyecto
                      <Arrow />
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <MetalDivider />

        {/* ---------- Filosofía personal ---------- */}
        <section className="relative py-24 sm:py-28">
          <div className="shell relative z-10">
            <Head
              eyebrow="Filosofía personal"
              title="Los valores que cultivo"
              lead="Más allá de lo técnico, estas son las capacidades que intento desarrollar cada día."
            />

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((v, i) => (
                <Reveal key={v.name} delay={0.04 * i}>
                  <div
                    className="chrome-edge flex h-full flex-col gap-2 rounded-2xl border border-hair-strong p-6"
                    style={{ background: CARD }}
                  >
                    <h3 className="font-display text-lg font-semibold text-ink">{v.name}</h3>
                    <p className="text-sm leading-relaxed text-ink-soft">{v.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
