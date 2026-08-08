"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

export type Accent = { from: string; to: string; glow: string };

export type UniversityCardData = {
  name: string;
  short_name: string | null;
  city: string | null;
  slug: string;
};

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Tarjeta de universidad — placa institucional reactiva.
 *
 * La sigla es el ancla visual de cada campus y el acento (derivado del slug)
 * le da identidad propia dentro de la paleta de la marca.
 *
 * Con mouse: un foco de luz sigue al cursor y la placa se inclina levemente
 * hacia él (perspectiva). En pantallas táctiles y con "reducir movimiento"
 * todo eso se desactiva: la tarjeta queda igual de sólida, solo quieta.
 */
export function UniversityCard({
  u,
  accent,
  index,
}: {
  u: UniversityCardData;
  accent: Accent;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef(0);

  const onMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    // Un solo cálculo por frame: el puntero puede disparar cientos de eventos.
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.style.setProperty("--rx", `${(0.5 - py) * 7}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * 9}deg`);
      el.style.setProperty("--lit", "1");
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--lit", "0");
  }, []);

  const sigla = u.short_name || u.name.slice(0, 4);
  const num = String(index + 1).padStart(2, "0");

  return (
    <div style={{ perspective: "1200px" }} className="h-full">
      <Link
        ref={ref}
        href={`/campus/${u.slug}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="uni-card group relative flex h-full flex-col overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-300 ease-out"
        style={
          {
            "--from": accent.from,
            "--to": accent.to,
            "--glow": accent.glow,
            "--mx": "50%",
            "--my": "0%",
            "--rx": "0deg",
            "--ry": "0deg",
            "--lit": "0",
            background: "linear-gradient(168deg, #171e30 0%, #0e1322 55%, #090d18 100%)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 30px 70px -32px rgba(0,0,0,0.95)",
          } as React.CSSProperties
        }
      >
        {/* Luz ambiental: recorre la placa por su cuenta, en todos los dispositivos.
            En celular y tablet es la que mantiene viva la tarjeta (no hay cursor).
            Se anima con transform → la resuelve el compositor, sin repintar. */}
        <span
          className="uni-ambient pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full opacity-45"
          style={{
            // Sin blur: hay una de estas por tarjeta y todas se animan. Con
            // muchas universidades en pantalla, cada desenfoque se recompone
            // en cada cuadro. El degradado ensanchado se ve igual.
            background: `radial-gradient(circle, rgba(${accent.glow},0.7) 0%, rgba(${accent.glow},0.3) 40%, rgba(${accent.glow},0.08) 62%, transparent 80%)`,
            animationDelay: `${(index % 5) * -3.2}s`,
          }}
          aria-hidden
        />

        {/* Foco que sigue al cursor (se suma a la luz ambiental cuando hay mouse) */}
        <span
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: "var(--lit)",
            background:
              "radial-gradient(340px circle at var(--mx) var(--my), rgba(var(--glow),0.30), transparent 62%)",
          }}
          aria-hidden
        />

        {/* Filo que se enciende del lado donde está el cursor */}
        <span
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
          style={{
            opacity: "var(--lit)",
            border: "1px solid transparent",
            background:
              "radial-gradient(240px circle at var(--mx) var(--my), rgba(var(--glow),0.85), transparent 60%) border-box",
            WebkitMask:
              "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
          aria-hidden
        />

        {/* Franja de acento superior */}
        <span
          className="absolute inset-x-0 top-0 h-1 origin-left transition-transform duration-500 group-hover:scale-y-[2.5]"
          style={{ background: "linear-gradient(90deg, var(--from), var(--to))" }}
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

        {/* Nodo decorativo: guiño a la red */}
        <span
          className="pointer-events-none absolute right-6 top-16 h-16 w-16 opacity-40 transition-opacity duration-500 group-hover:opacity-80"
          aria-hidden
        >
          <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
            <path d="M8 40 L28 18 L56 30" stroke={`rgba(${accent.glow},0.5)`} strokeWidth="1" />
            <path d="M28 18 L34 52" stroke={`rgba(${accent.glow},0.3)`} strokeWidth="1" />
            <circle cx="28" cy="18" r="2.5" fill={accent.from} />
            <circle cx="8" cy="40" r="1.5" fill={`rgba(${accent.glow},0.7)`} />
            <circle cx="56" cy="30" r="1.5" fill={`rgba(${accent.glow},0.7)`} />
            <circle cx="34" cy="52" r="1.5" fill={`rgba(${accent.glow},0.7)`} />
          </svg>
        </span>

        {/* ---- Cuerpo ---- */}
        <div className="relative flex flex-1 flex-col p-7 pb-5 sm:p-8 sm:pb-6">
          <span className="font-mono text-[0.6rem] tracking-[0.3em] text-ink-faint">{num}</span>

          {/* La sigla manda: grabada en la placa */}
          <div className="mt-2 flex items-start justify-between gap-4">
            <span
              className="text-ti animate-shimmer select-none font-display text-[3.4rem] font-bold leading-[0.85] tracking-tight sm:text-[4.2rem]"
              style={{ filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.6))" }}
              aria-hidden
            >
              {sigla}
            </span>
            <span
              className="mt-2 inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/80"
              style={{
                background: "rgba(var(--glow),0.14)",
                border: "1px solid rgba(var(--glow),0.45)",
              }}
            >
              <span
                className="pulse-dot h-1.5 w-1.5 rounded-full"
                style={{ background: accent.from, boxShadow: `0 0 9px 1px rgba(${accent.glow},0.95)` }}
              />
              Activo
            </span>
          </div>

          <span
            className="mt-5 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(var(--glow),0.7), rgba(255,255,255,0.06) 70%, transparent)",
            }}
            aria-hidden
          />

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

        {/* ---- Barra inferior ---- */}
        <div
          className="relative flex items-center justify-between gap-3 px-7 py-4 sm:px-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.09)" }}
        >
          <span
            className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
            style={{ background: "linear-gradient(90deg, rgba(var(--glow),0.22), transparent)" }}
            aria-hidden
          />
          <span className="relative font-mono text-[0.68rem] uppercase tracking-[0.2em] text-white">
            Ver campus
          </span>
          <span
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-500 group-hover:translate-x-1"
            style={{
              background: "linear-gradient(180deg, var(--from), var(--to))",
              boxShadow: `0 10px 24px -10px rgba(${accent.glow},0.95)`,
            }}
          >
            <Arrow />
          </span>
        </div>
      </Link>
    </div>
  );
}
