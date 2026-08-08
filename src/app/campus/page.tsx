import type { Metadata } from "next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { GlobalNet } from "@/components/campus/GlobalNet";
import { UniversityCard } from "@/components/campus/UniversityCard";
import { CAMPUS } from "@/lib/campus";
import { createPublicClient } from "@/lib/supabase/public";
import { unwrapOrThrow } from "@/lib/log";

export const metadata: Metadata = {
  title: "Campus",
  description: CAMPUS.description,
};

export const revalidate = 60;

/**
 * Acento propio de cada universidad, derivado de su slug.
 * Todos los tonos viven dentro de la familia azul de la marca: la grilla se
 * lee como un sistema coherente, pero cada campus tiene identidad propia.
 */
const ACCENTS = [
  { from: "#6e93ff", to: "#1e42b0", glow: "59,107,255" }, // azul señal
  { from: "#7f7bff", to: "#3a2fae", glow: "110,101,255" }, // índigo
  { from: "#4fc4ff", to: "#1666b8", glow: "62,163,235" }, // cian técnico
  { from: "#9b8cff", to: "#4b2fae", glow: "132,110,255" }, // violeta
  { from: "#5ad4d4", to: "#137a86", glow: "70,190,196" }, // turquesa
];

function accentOf(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

type University = {
  id: string;
  name: string;
  short_name: string | null;
  city: string | null;
  slug: string;
};

export default async function CampusPage() {
  const supabase = createPublicClient();
  // unwrapOrThrow, no unwrap: si la consulta falla no se cachea un campus
  // vacío para todo el mundo — Next sigue sirviendo la última versión buena.
  const universities = unwrapOrThrow(
    "campus universities",
    await supabase
      .from("universities")
      .select("id, name, short_name, city, slug")
      .eq("status", "active")
      .order("name"),
    [] as University[],
  ) as University[];

  return (
    <>
      <Nav />
      <main className="relative">
        <GlobalNet />

        <div className="shell relative z-10 pt-32 pb-24 sm:pt-40">
          <div className="flex flex-col gap-4">
            <Reveal>
              <span className="eyebrow flex items-center gap-3">
                <span className="metal-tick" />
                {CAMPUS.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-[length:var(--text-h1)] font-bold leading-[0.95] tracking-tight text-ink">
                {CAMPUS.title}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-ti animate-shimmer font-display text-[length:var(--text-h3)] font-semibold leading-tight">
                {CAMPUS.lead}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
                {CAMPUS.description}
              </p>
            </Reveal>
          </div>

          <div className="mt-12">
            <Reveal>
              <p className="eyebrow mb-5 flex items-center gap-3">
                <span className="metal-tick" />
                Elegí tu universidad
              </p>
            </Reveal>

            {/* Una sola grilla: las universidades y los lugares por ocupar comparten
                la misma retícula, para que nunca quede una tarjeta estirada. */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {universities.map((u, i) => (
                <Reveal key={u.id} delay={0.05 * i} className="min-w-0">
                  <UniversityCard u={u} accent={accentOf(u.slug)} index={i} />
                </Reveal>
              ))}

              {Array.from({ length: Math.max(0, 3 - universities.length) }).map((_, i) => (
                <Reveal key={`slot-${i}`} delay={0.05 * (universities.length + i)} className="min-w-0">
                  <div
                    className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-3xl p-8 text-center"
                    style={{
                      border: "1px dashed rgba(255,255,255,0.13)",
                      background:
                        "linear-gradient(168deg, rgba(23,30,48,0.32), rgba(9,13,24,0.5))",
                    }}
                  >
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">
                      Nodo disponible
                    </span>
                    <span className="metal-tick opacity-40" />
                    <span className="max-w-[14rem] text-sm leading-relaxed text-ink-mute">
                      Tu universidad puede ser la próxima en sumarse a la red.
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
