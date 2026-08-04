import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { AcademyBackdrop } from "@/components/academy/AcademyBackdrop";
import { ProfesoresList } from "@/components/academy/ProfesoresList";
import { ACADEMY, getUniversity } from "@/lib/academy";

export const metadata: Metadata = {
  title: "Academia · Profesores Particulares",
  description:
    "Profesores particulares de Ingeniería en la Universidad Nacional del Comahue: análisis matemático, álgebra y más. Preparate para materias, parciales, finales e ingreso — una alianza académica de Cursemos Ingeniería.",
};

export default function AcademiaPage() {
  const university = getUniversity("unco");
  if (!university) notFound();

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <AcademyBackdrop />

        <div className="shell relative z-10 pt-32 pb-24 sm:pt-40">
          {/* Encabezado institucional grande */}
          <div className="flex flex-col gap-4">
            <Reveal>
              <span className="eyebrow flex items-center gap-3">
                <span className="metal-tick" />
                {ACADEMY.eyebrow} · Profesores Particulares
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-[length:var(--text-h1)] font-bold leading-[0.95] tracking-tight text-ink">
                Ingeniería
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-ti animate-shimmer font-display text-[length:var(--text-h3)] font-semibold leading-tight">
                Universidad Nacional del Comahue
              </p>
            </Reveal>
            <Reveal delay={0.13}>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="blue" dot>
                  {ACADEMY.alliance}
                </Badge>
                <span className="font-mono text-xs text-ink-mute">
                  Facultad de Ingeniería · {university.city}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
                {ACADEMY.description}
              </p>
            </Reveal>
          </div>

          {/* Tarjetas de profesores — reutiliza el listado compartido */}
          <div className="mt-12">
            <ProfesoresList />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
