import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { AmbientLights } from "@/components/ui/AmbientLights";
import { ProjectCover } from "@/components/ui/ProjectCover";
import { PROJECTS, STATUS, getProject } from "@/lib/projects";
import { ORG } from "@/lib/org";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Proyecto no encontrado" };
  return { title: p.name, description: p.summary };
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <span className="eyebrow">{title}</span>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const st = STATUS[p.status];
  const mailBody = `Hola Gerónimo,\n\nEstuve viendo el proyecto ${p.name} y me gustaría colaborar.\n\nCreo que podría aportar en __________________.\n\nMe interesa especialmente participar porque __________________.\n\nQuedo a disposición para conversar.\n\nSaludos.`;
  const mail = `mailto:${ORG.email}?subject=${encodeURIComponent(
    `Quiero colaborar con ${p.name}`
  )}&body=${encodeURIComponent(mailBody)}`;

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <AmbientLights variant="blue" />
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />

        <div className="shell relative z-10 pt-32 pb-24 sm:pt-40">
          <Reveal>
            <Link
              href="/#ecosistema"
              className="font-mono text-xs text-ink-mute transition-colors hover:text-ink"
            >
              ← Ecosistema
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <ProjectCover project={p} variant="hero" className="mt-8 lift" />
          </Reveal>

          {/* Header */}
          <div className="mt-10 flex flex-col gap-5 border-b border-hair pb-12">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-mute">
                  {p.category}
                </span>
                <Badge tone={st.tone} dot pulse={p.status === "escalando"}>
                  {st.label}
                </Badge>
                <span className="font-mono text-xs text-ink-mute">· {p.year}</span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-[length:var(--text-h1)] font-bold leading-[0.98] tracking-tight text-ink">
                {p.name}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
                {p.summary}
              </p>
            </Reveal>
            {p.draft && (
              <Reveal delay={0.12}>
                <p className="font-mono text-xs text-amber-200/80">
                  Ficha en construcción — se completará a medida que el proyecto avance.
                </p>
              </Reveal>
            )}
          </div>

          {/* Body */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            {/* Main */}
            <div className="flex flex-col gap-12">
              <Reveal>
                <div>
                  <span className="eyebrow">Objetivo</span>
                  <p className="mt-4 text-[length:var(--text-h3)] font-display font-medium leading-snug text-ink">
                    {p.objective}
                  </p>
                </div>
              </Reveal>

              {p.features && p.features.length > 0 && (
                <Reveal>
                  <div>
                    <span className="eyebrow">Funciones</span>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {p.features.map((f) => (
                        <div
                          key={f}
                          className="glass-bright rounded-2xl p-4 text-sm font-medium text-ink"
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              <Reveal>
                <div className="flex flex-col gap-4">
                  <span className="eyebrow">Descripción</span>
                  {p.description.map((d, i) => (
                    <p key={i} className="leading-relaxed text-ink-soft">
                      {d}
                    </p>
                  ))}
                </div>
              </Reveal>

              {p.vision && (
                <Reveal>
                  <div className="glass-bright rounded-3xl p-7 sm:p-8">
                    <span className="eyebrow">Visión</span>
                    <p className="mt-4 font-display text-[length:var(--text-h3)] font-medium leading-snug text-ink">
                      {p.vision}
                    </p>
                  </div>
                </Reveal>
              )}

              {p.gallery && p.gallery.length > 0 && (
                <Reveal>
                  <div>
                    <span className="eyebrow">Capturas</span>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {p.gallery.map((g) => (
                        <div
                          key={g}
                          className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hair bg-void"
                        >
                          <Image
                            src={g}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 40vw"
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {p.roadmap.length > 0 && (
                <Reveal>
                  <div>
                    <span className="eyebrow">Roadmap</span>
                    <ul className="mt-5 flex flex-col gap-3">
                      {p.roadmap.map((r) => (
                        <li key={r.label} className="flex items-center gap-3">
                          <span
                            className={
                              r.done
                                ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"
                                : "flex h-5 w-5 items-center justify-center rounded-full border border-hair-strong text-ink-mute"
                            }
                          >
                            {r.done ? "✓" : ""}
                          </span>
                          <span className={r.done ? "text-ink" : "text-ink-soft"}>{r.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}

              <Reveal>
                <div>
                  <span className="eyebrow">Actualizaciones</span>
                  <div className="mt-5 flex flex-col gap-4">
                    {p.updates.map((u, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="font-mono text-xs text-ti-300">{u.date}</span>
                        <span className="text-sm leading-relaxed text-ink-soft">{u.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              <Reveal>
                <Panel title="Estado">
                  <div className="flex items-center gap-3">
                    <Badge tone={st.tone} dot pulse={p.status === "escalando"}>
                      {st.label}
                    </Badge>
                    <span className="font-mono text-xs text-ink-mute">{p.year}</span>
                  </div>
                </Panel>
              </Reveal>

              {p.links && p.links.length > 0 && (
                <Reveal delay={0.03}>
                  <Panel title="Enlaces y redes">
                    <div className="flex flex-col gap-2">
                      {p.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-hair px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:border-blue-500/40 hover:text-ink"
                        >
                          {l.label}
                          <span className="text-ink-mute">↗</span>
                        </a>
                      ))}
                    </div>
                  </Panel>
                </Reveal>
              )}

              {p.tech.length > 0 && (
                <Reveal delay={0.05}>
                  <Panel title="Tecnología">
                    <div className="flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className="chip rounded-full px-3 py-1.5 text-xs font-medium text-ti-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Panel>
                </Reveal>
              )}

              <Reveal delay={0.1}>
                <Panel title="Equipo">
                  <ul className="flex flex-col gap-2.5">
                    {p.team.map((m) => (
                      <li key={m.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink">{m.name}</span>
                        <span className="font-mono text-xs text-ink-mute">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="glass-lux chrome-edge rounded-3xl p-6 sm:p-7">
                  <span className="eyebrow">Cómo colaborar</span>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {p.collaborate.map((c) => (
                      <li key={c} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a href={mail} className="btn btn-metal mt-6 w-full text-sm">
                    Colaborar en {p.name}
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
