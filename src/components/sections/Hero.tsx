"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { HeroField } from "@/components/sections/HeroField";

const ease = [0.16, 1, 0.3, 1] as const;

/** Ícono de birrete para el acceso destacado al Campus. */
function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  );
}

/**
 * Hero principal de Cursemos Ingeniería — composición cinematográfica:
 * frase intro + título gigante a la izquierda, símbolo del logo imponente a la
 * derecha. Ocupa toda la altura, iluminación azul/plata (lienzo global).
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      {/* Base profunda — negros y azules, sombras marcadas */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,5,12,0.55) 0%, rgba(4,7,16,0.15) 26%, transparent 52%, rgba(3,5,12,0.6) 100%)",
        }}
        aria-hidden
      />

      {/* Atmósfera azul cinematográfica */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Key light azul intenso (arriba-izquierda) */}
        <div
          className="animate-drift-slow absolute -left-[14%] -top-[8%] h-[50rem] w-[50rem] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(59,107,255,0.5), transparent 65%)" }}
        />
        {/* Halo acero (derecha, detrás del logo) */}
        <div
          className="animate-drift absolute -right-[8%] top-[20%] h-[40rem] w-[40rem] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(120,150,235,0.26), transparent 70%)" }}
        />
        {/* Relleno índigo profundo (abajo-izquierda) */}
        <div
          className="animate-drift absolute -bottom-[26%] left-[14%] h-[42rem] w-[42rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(18,42,130,0.55), transparent 72%)" }}
        />
        {/* Destello anamórfico horizontal */}
        <div
          className="absolute inset-x-0 top-[43%] h-[3px] opacity-70 blur-[6px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(140,175,255,0.5), rgba(255,255,255,0.6), rgba(140,175,255,0.5), transparent)",
          }}
        />
      </div>

      {/* Red de nodos animada — movimiento y vida */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <HeroField />
      </div>

      {/* Viñeta — sombras cinematográficas para foco y contraste */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(130% 110% at 30% 42%, transparent 38%, rgba(1,3,8,0.72) 100%)",
        }}
        aria-hidden
      />

      <div className="shell relative z-10 w-full py-28 lg:py-0">
        <div className="grid items-center gap-10 lg:grid-cols-[1.45fr_0.55fr] lg:gap-6">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="order-2 flex flex-col items-start gap-7 lg:order-1"
          >
            <span className="eyebrow flex items-center gap-3">
              <span className="metal-tick" />
              Bienvenidos al cambio.
            </span>

            <h1 className="flex flex-col gap-1 font-display font-bold leading-[1.08] tracking-[-0.035em] text-[clamp(3rem,1rem+10.5vw,8rem)] sm:gap-2">
              <span
                className="text-ink"
                style={{ textShadow: "0 3px 26px rgba(0,0,0,0.5), 0 0 58px rgba(120,150,255,0.36)" }}
              >
                Cursemos
              </span>
              <span
                className="pb-[0.08em] text-ti animate-shimmer"
                style={{ filter: "drop-shadow(0 4px 22px rgba(0,0,0,0.45))" }}
              >
                Ingeniería
              </span>
            </h1>

            <p className="max-w-2xl text-[length:clamp(1.2rem,1rem+0.9vw,1.7rem)] font-medium leading-snug text-ink-soft">
              El <span className="font-semibold text-ink">punto de encuentro</span>{" "}
              para quienes quieren dejar una{" "}
              <span className="text-ti animate-shimmer font-semibold">
                huella en el mundo
              </span>
              .
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link href="/campus" className="btn btn-blue">
                <CapIcon />
                Explorar Campus
              </Link>
              <a href="#vision" className="btn btn-ghost">
                Conocer el proyecto
              </a>
            </div>
          </motion.div>

          {/* Símbolo del logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.1, ease }}
            className="relative order-1 flex justify-center lg:order-2 lg:justify-end"
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px]"
              style={{ background: "radial-gradient(circle, rgba(59,107,255,0.45), transparent 70%)" }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-[8%] top-[10%] h-[42%] w-[42%] rounded-full blur-[60px]"
              style={{ background: "radial-gradient(circle, rgba(200,215,255,0.22), transparent 70%)" }}
              aria-hidden
            />
            <Image
              src="/images/cursemos-icon.png"
              alt="Cursemos Ingeniería"
              width={452}
              height={416}
              priority
              unoptimized
              className="relative w-[42vw] max-w-[11rem] object-contain lg:w-full lg:max-w-[21rem]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
