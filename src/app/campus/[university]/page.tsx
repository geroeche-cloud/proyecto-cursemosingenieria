import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { GlobalNet } from "@/components/campus/GlobalNet";
import { CampusCrumb } from "@/components/campus/CampusCrumb";
import { AmbassadorCard } from "@/components/campus/AmbassadorCard";
import { ProfesoresList } from "@/components/academy/ProfesoresList";
import { OpportunitiesList } from "@/components/campus/OpportunitiesList";
import { DrivesList } from "@/components/campus/DrivesList";
import { SparkTitle } from "@/components/campus/SparkTitle";
import { campusUniversityParams, getAmbassador, getCampusArea } from "@/lib/campus";
import { getUniversity } from "@/lib/academy";

export function generateStaticParams() {
  return campusUniversityParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ university: string }>;
}): Promise<Metadata> {
  const { university } = await params;
  const u = getUniversity(university);
  return { title: u ? `Campus · ${u.short}` : "Campus" };
}

/** Distintivo "Vigentes" — punto verde con glow, indica convocatorias activas. */
function LivePill() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
      style={{
        background: "rgba(16,185,129,0.12)",
        border: "1px solid rgba(16,185,129,0.42)",
        color: "#34d399",
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: "#34d399", boxShadow: "0 0 9px 1px rgba(52,211,153,0.9)" }}
      />
      Vigentes
    </span>
  );
}

/** Encabezado de sección: epígrafe metálico, título y bajada. */
function SectionHead({
  eyebrow,
  title,
  description,
  featured = false,
  live = false,
  titleNode,
}: {
  eyebrow: string;
  title: string;
  description: string;
  featured?: boolean;
  live?: boolean;
  titleNode?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="eyebrow flex items-center gap-3">
        <span className="metal-tick" />
        {eyebrow}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {titleNode ?? (
          <h2
            className={
              featured
                ? "text-ti animate-shimmer font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight"
                : "font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight text-ink"
            }
          >
            {title}
          </h2>
        )}
        {live && <LivePill />}
      </div>
      <p className="max-w-2xl leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}

/** Bloque de sección con separación y contenido. */
function Section({ children }: { children: ReactNode }) {
  return (
    <section className="mt-20 flex flex-col gap-8 sm:mt-24">{children}</section>
  );
}

export default async function CampusUniversityPage({
  params,
}: {
  params: Promise<{ university: string }>;
}) {
  const { university } = await params;
  const u = getUniversity(university);
  if (!u) notFound();

  const ambassador = getAmbassador(u.id);
  const oportunidades = getCampusArea("oportunidades");
  const alianzas = getCampusArea("alianzas");
  const recursos = getCampusArea("recursos");

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <GlobalNet />

        <div className="shell relative z-10 pt-32 pb-24 sm:pt-40">
          <Reveal>
            <CampusCrumb items={[{ label: "Campus", href: "/campus" }, { label: u.short }]} />
          </Reveal>

          <div className="mt-6 flex flex-col gap-4">
            <Reveal delay={0.05}>
              <h1 className="font-display text-[length:var(--text-h1)] font-bold leading-[0.95] tracking-tight text-ink">
                {u.name}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-mono text-xs text-ink-mute">
                Facultad de Ingeniería · {u.city}
              </p>
            </Reveal>
          </div>

          {/* 1 · Embajador / referente */}
          {ambassador && (
            <Section>
              <Reveal>
                <AmbassadorCard ambassador={ambassador} universityName={u.name} />
              </Reveal>
            </Section>
          )}

          {/* 2 · Noticias y oportunidades — sección destacada, sin caja que corte */}
          {oportunidades && (
            <Section>
              <div className="relative">
                <span
                  className="animate-drift-slow pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full opacity-40 blur-[90px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59,107,255,0.5), transparent 70%)",
                  }}
                  aria-hidden
                />
                <Reveal>
                  <SectionHead
                    eyebrow="Novedades"
                    title={oportunidades.label}
                    description={oportunidades.description}
                    featured
                    live
                  />
                </Reveal>
              </div>
              <OpportunitiesList universityId={u.id} />
            </Section>
          )}

          {/* 3 · Alianzas académicas */}
          {alianzas && (
            <Section>
              <Reveal>
                <SectionHead
                  eyebrow="Acompañamiento"
                  title={alianzas.label}
                  description={alianzas.description}
                />
              </Reveal>
              <ProfesoresList />
            </Section>
          )}

          {/* 4 · Recursos de estudio — drives compartidos por estudiantes */}
          {recursos && (
            <Section>
              <Reveal>
                <SectionHead
                  eyebrow="La sinergia académica"
                  title={recursos.label}
                  description={`Drives compartidos por estudiantes de la ${u.name}: apuntes, exámenes y material de cada carrera, con acceso directo.`}
                  titleNode={
                    <SparkTitle
                      text={recursos.label}
                      className="text-ti animate-shimmer font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight"
                    />
                  }
                />
              </Reveal>
              <DrivesList universityId={u.id} />
            </Section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
