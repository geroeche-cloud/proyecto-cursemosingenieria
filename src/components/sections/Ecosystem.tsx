import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { AmbientLights } from "@/components/ui/AmbientLights";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { ProjectCover } from "@/components/ui/ProjectCover";
import { PROJECTS, STATUS } from "@/lib/projects";
import { cn } from "@/lib/cn";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Ecosystem() {
  return (
    <section id="ecosistema" className="relative overflow-hidden py-28 sm:py-36">
      <AmbientLights variant="blue" />
      <div className="shell relative z-10">
        <SectionLabel
          eyebrow="02 — Ecosistema"
          title="Un ecosistema de proyectos"
          lead="Lo que estoy construyendo, en un solo lugar."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => {
            const st = STATUS[p.status];
            return (
              <Reveal
                key={p.slug}
                delay={0.05 * i}
                className={cn(p.featured && "md:col-span-2 lg:col-span-2")}
              >
                <article
                  className={cn(
                    "group relative flex h-full cursor-pointer flex-col rounded-3xl p-5 sm:p-6 lift",
                    p.featured ? "glass-lux chrome-edge" : "glass"
                  )}
                >
                  <ProjectCover project={p} featured={p.featured} className="mb-6" />

                  <div className="flex items-center justify-between gap-3">
                    <Badge tone={st.tone} dot pulse={p.status === "escalando"}>
                      {st.label}
                    </Badge>
                    <span className="font-mono text-xs text-ink-mute">{p.year}</span>
                  </div>

                  <div className="mt-4">
                    <h3
                      className={cn(
                        "font-display font-semibold leading-tight text-ink",
                        p.featured ? "text-2xl sm:text-3xl" : "text-2xl"
                      )}
                    >
                      {p.name}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-ti-500">{p.tagline}</p>
                    <p
                      className={cn(
                        "mt-3 leading-relaxed text-ink-soft",
                        p.featured ? "max-w-xl text-base" : "text-sm"
                      )}
                    >
                      {p.summary}
                    </p>
                  </div>

                  {/* Accesos rápidos (redes / comunidad) — por encima del stretched link */}
                  {p.links && p.links.length > 0 && (
                    <div className="relative z-10 mt-5 flex flex-wrap gap-2">
                      {p.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chip rounded-full px-3.5 py-1.5 text-xs font-medium text-ti-100 transition-colors hover:text-white"
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center pt-6">
                    <Link
                      href={`/proyectos/${p.slug}`}
                      className="flex items-center gap-2 text-sm font-medium text-ink transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-blue-300"
                      aria-label={`Ver proyecto ${p.name}`}
                    >
                      Ver proyecto
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        <Arrow />
                      </span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
