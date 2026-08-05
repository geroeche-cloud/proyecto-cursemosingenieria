import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { GlobalNet } from "@/components/campus/GlobalNet";
import { CAMPUS } from "@/lib/campus";
import { createPublicClient } from "@/lib/supabase/public";

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

/** Pin de ubicación del campus — para la tarjeta de cada universidad. */
function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21c4.4-4.2 6.5-7.2 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 13.8 7.6 16.8 12 21Z" />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  );
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
  const { data } = await supabase
    .from("universities")
    .select("id, name, short_name, city, slug")
    .eq("status", "active")
    .order("name");
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
              className={`grid gap-6 ${
                universities.length > 1 ? "sm:grid-cols-2" : ""
              }`}
            >
              {universities.map((u, i) => (
                <Reveal key={u.id} delay={0.05 * i}>
                  <Link
                    href={`/campus/${u.slug}`}
                    className="group relative flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-[1.75rem] p-7 transition-all duration-500 hover:-translate-y-1 sm:min-h-[18rem] sm:p-9"
                    style={{
                      background:
                        "linear-gradient(158deg, rgba(20,27,45,0.9) 0%, rgba(8,11,22,0.94) 100%)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow:
                        "0 34px 66px -26px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.09)",
                      backdropFilter: "blur(14px)",
                    }}
                  >
                    {/* Monograma gigante de la sigla */}
                    <span
                      className="pointer-events-none absolute -bottom-10 -right-3 select-none whitespace-nowrap font-display text-[9rem] font-bold leading-none text-white/[0.045] transition-colors duration-500 group-hover:text-blue-300/[0.1]"
                      aria-hidden
                    >
                      {u.short_name}
                    </span>

                    {/* Línea superior luminosa */}
                    <span
                      className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(130,160,255,0.9), transparent)",
                      }}
                      aria-hidden
                    />

                    {/* Resplandor azul en movimiento */}
                    <span
                      className="animate-drift-slow pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-40 blur-[70px] transition-opacity duration-500 group-hover:opacity-90"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(59,107,255,0.8), transparent 70%)",
                      }}
                      aria-hidden
                    />

                    {/* Rayo de luz diagonal que barre en hover */}
                    <span
                      className="pointer-events-none absolute -inset-y-12 left-[12%] w-16 -rotate-[24deg] opacity-0 blur-2xl transition-all duration-700 ease-out group-hover:left-[72%] group-hover:opacity-70"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(190,210,255,0.95), transparent)",
                      }}
                      aria-hidden
                    />

                    {/* Halo azul que se enciende */}
                    <span
                      className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        border: "1px solid rgba(90,130,255,0.6)",
                        boxShadow:
                          "0 0 50px -6px rgba(59,107,255,0.55), inset 0 0 40px -16px rgba(130,160,255,0.8)",
                      }}
                      aria-hidden
                    />

                    {/* Encabezado: placa con pin + sigla con punto vivo */}
                    <div className="relative flex items-start justify-between gap-4">
                      <span
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-blue-100 transition-all duration-500 group-hover:scale-105"
                        style={{
                          background:
                            "linear-gradient(158deg, rgba(59,107,255,0.4), rgba(26,58,168,0.16))",
                          border: "1px solid rgba(120,150,255,0.42)",
                          boxShadow:
                            "0 10px 24px -10px rgba(59,107,255,0.7), inset 0 1px 0 rgba(255,255,255,0.2)",
                        }}
                      >
                        <PinIcon />
                      </span>
                      <span className="chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ti-100">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: "#6e93ff",
                            boxShadow: "0 0 9px 1px rgba(110,147,255,0.95)",
                          }}
                        />
                        {u.short_name}
                      </span>
                    </div>

                    {/* Nombre */}
                    <div className="relative mt-8 flex flex-col gap-2">
                      <span className="font-display text-2xl font-bold leading-tight tracking-tight text-ink transition-colors duration-500 group-hover:text-white sm:text-[2rem]">
                        {u.name}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-mute">
                        Facultad de Ingeniería · {u.city}
                      </span>
                    </div>

                    {/* CTA en pill */}
                    <div className="relative mt-7">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-blue-200 transition-all duration-500 group-hover:text-white"
                        style={{
                          background: "rgba(59,107,255,0.12)",
                          border: "1px solid rgba(110,147,255,0.35)",
                        }}
                      >
                        Ver campus
                        <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                          <Arrow />
                        </span>
                      </span>
                    </div>
                  </Link>
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
