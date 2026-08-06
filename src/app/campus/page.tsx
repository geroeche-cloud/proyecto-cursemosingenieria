import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { GlobalNet } from "@/components/campus/GlobalNet";
import { CAMPUS } from "@/lib/campus";
import { createPublicClient } from "@/lib/supabase/public";
import { logIfError } from "@/lib/log";

export const metadata: Metadata = {
  title: "Campus",
  description: CAMPUS.description,
};

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export const revalidate = 60;

type University = {
  id: string;
  name: string;
  short_name: string | null;
  city: string | null;
  slug: string;
};

export default async function CampusPage() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("universities")
    .select("id, name, short_name, city, slug")
    .eq("status", "active")
    .order("name");
  logIfError("campus universities", error);
  const universities = (data ?? []) as University[];

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
            <div
              className={`grid gap-5 ${
                universities.length > 1 ? "sm:grid-cols-2" : ""
              } ${universities.length > 2 ? "xl:grid-cols-3" : ""}`}
            >
              {universities.map((u, i) => {
                const a = accentOf(u.slug);
                const sigla = u.short_name || u.name.slice(0, 4);
                return (
                  <Reveal key={u.id} delay={0.05 * i}>
                    <Link
                      href={`/campus/${u.slug}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1.5"
                      style={{
                        background: "linear-gradient(168deg, #171e30 0%, #0e1322 55%, #090d18 100%)",
                        border: "1px solid rgba(255,255,255,0.16)",
                        boxShadow: "0 30px 70px -32px rgba(0,0,0,0.95)",
                      }}
                    >
                      {/* Franja de acento: identidad de la universidad, crece al pasar */}
                      <span
                        className="absolute inset-x-0 top-0 h-1 origin-left transition-transform duration-500 group-hover:scale-y-[2.5]"
                        style={{ background: `linear-gradient(90deg, ${a.from}, ${a.to})` }}
                        aria-hidden
                      />

                      {/* Resplandor propio del acento, detrás de la sigla */}
                      <span
                        className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-30 blur-[60px] transition-opacity duration-500 group-hover:opacity-70"
                        style={{ background: `radial-gradient(circle, rgba(${a.glow},0.9), transparent 70%)` }}
                        aria-hidden
                      />

                      {/* Trama técnica */}
                      <span
                        className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-50"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(156,182,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(156,182,255,0.10) 1px, transparent 1px)",
                          backgroundSize: "28px 28px",
                          maskImage: "linear-gradient(180deg, #000, transparent 65%)",
                          WebkitMaskImage: "linear-gradient(180deg, #000, transparent 65%)",
                        }}
                        aria-hidden
                      />

                      {/* Barrido de luz */}
                      <span
                        className="pointer-events-none absolute -inset-y-16 -left-1/3 w-24 -rotate-[20deg] opacity-0 blur-2xl transition-all duration-[900ms] ease-out group-hover:left-[110%] group-hover:opacity-60"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(210,225,255,0.9), transparent)" }}
                        aria-hidden
                      />

                      {/* ---- Cuerpo ---- */}
                      <div className="relative flex flex-1 flex-col p-7 pb-5 sm:p-8 sm:pb-6">
                        {/* La sigla manda: es el ancla visual de cada campus */}
                        <div className="flex items-start justify-between gap-4">
                          <span
                            className="text-ti animate-shimmer select-none font-display text-[3.4rem] font-bold leading-[0.85] tracking-tight sm:text-[4rem]"
                            aria-hidden
                          >
                            {sigla}
                          </span>
                          <span
                            className="mt-1.5 inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/80"
                            style={{
                              background: `rgba(${a.glow},0.14)`,
                              border: `1px solid rgba(${a.glow},0.45)`,
                            }}
                          >
                            <span
                              className="pulse-dot h-1.5 w-1.5 rounded-full"
                              style={{ background: a.from, boxShadow: `0 0 9px 1px rgba(${a.glow},0.95)` }}
                            />
                            Activo
                          </span>
                        </div>

                        {/* Línea técnica que separa sigla de datos */}
                        <span
                          className="mt-5 h-px w-full origin-left scale-x-100 transition-all duration-500"
                          style={{
                            background: `linear-gradient(90deg, rgba(${a.glow},0.7), rgba(255,255,255,0.06) 70%, transparent)`,
                          }}
                          aria-hidden
                        />

                        {/* Nombre + ficha */}
                        <h3 className="mt-4 font-display text-xl font-bold leading-snug tracking-tight text-ink transition-colors duration-500 group-hover:text-white sm:text-2xl">
                          {u.name}
                        </h3>
                        <p className="mt-2 font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.14em] text-ink-mute">
                          Facultad de Ingeniería
                          {u.city ? (
                            <>
                              <br />
                              <span className="text-ti-500">{u.city}</span>
                            </>
                          ) : null}
                        </p>
                      </div>

                      {/* ---- Barra inferior: se llena de color al pasar ---- */}
                      <div
                        className="relative flex items-center justify-between gap-3 px-7 py-4 sm:px-8"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.09)" }}
                      >
                        <span
                          className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
                          style={{ background: `linear-gradient(90deg, rgba(${a.glow},0.22), transparent)` }}
                          aria-hidden
                        />
                        <span className="relative font-mono text-[0.68rem] uppercase tracking-[0.2em] text-white">
                          Ver campus
                        </span>
                        <span
                          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-all duration-500 group-hover:scale-110"
                          style={{
                            background: `linear-gradient(180deg, ${a.from}, ${a.to})`,
                            boxShadow: `0 10px 24px -10px rgba(${a.glow},0.95)`,
                          }}
                        >
                          <Arrow />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
