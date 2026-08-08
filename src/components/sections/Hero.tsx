import Image from "next/image";
import Link from "next/link";
import { HeroField } from "@/components/sections/HeroField";

/**
 * SERVER COMPONENT. Antes era cliente únicamente para dos animaciones de
 * entrada con `motion`. Eso convertía todo el hero —la primera pantalla que ve
 * cualquier visitante— en JavaScript que había que descargar, parsear e
 * hidratar antes de que sirviera para algo. Ahora las animaciones son CSS y el
 * hero llega listo desde el servidor.
 */

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

      {/*
        Atmósfera azul cinematográfica.

        SIN `blur-[...]`, a propósito. Antes cada una de estas luces era un
        círculo de ~700 px con blur(120px) — y las tres se animan con deriva,
        así que el navegador tenía que recomponer tres capas desenfocadas
        gigantes en cada cuadro. Medido con Lighthouse: 1.203 ms de pintado y
        1.088 ms de estilo/layout, que era casi todo el retraso en mostrar el
        titular en celular.

        El desenfoque era redundante: un degradado radial YA es un degradado
        suave. Se compensó ensanchando las paradas de color, así que el
        resultado se ve igual y no cuesta nada.
      */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Key light azul intenso (arriba-izquierda) */}
        <div
          className="animate-drift-slow absolute -left-[14%] -top-[8%] h-[50rem] w-[50rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,107,255,0.42) 0%, rgba(59,107,255,0.2) 34%, rgba(59,107,255,0.06) 58%, transparent 76%)",
          }}
        />
        {/* Halo acero (derecha, detrás del logo) */}
        <div
          className="animate-drift absolute -right-[8%] top-[20%] h-[40rem] w-[40rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(120,150,235,0.24) 0%, rgba(120,150,235,0.12) 38%, rgba(120,150,235,0.04) 62%, transparent 80%)",
          }}
        />
        {/* Relleno índigo profundo (abajo-izquierda) */}
        <div
          className="animate-drift absolute -bottom-[26%] left-[14%] h-[42rem] w-[42rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(18,42,130,0.5) 0%, rgba(18,42,130,0.26) 36%, rgba(18,42,130,0.08) 60%, transparent 80%)",
          }}
        />
        {/* Destello anamórfico horizontal — 6px de desenfoque sobre 3px de
            alto es barato y no tiene equivalente en degradado. Se conserva. */}
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
          <div className="hero-texto order-2 flex flex-col items-start gap-7 lg:order-1">
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
          </div>

          {/* Símbolo del logo */}
          <div className="hero-simbolo relative order-1 flex justify-center lg:order-2 lg:justify-end">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(59,107,255,0.4) 0%, rgba(59,107,255,0.18) 40%, rgba(59,107,255,0.05) 64%, transparent 82%)",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-[8%] top-[10%] h-[42%] w-[42%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(200,215,255,0.2) 0%, rgba(200,215,255,0.09) 42%, transparent 78%)",
              }}
              aria-hidden
            />
            <Image
              src="/images/cursemos-icon.png"
              alt="Cursemos Ingeniería"
              width={452}
              height={416}
              priority
              quality={90}
              // El ancho real está topeado por max-w-[11rem] / max-w-[21rem],
              // no por el 42vw. Declarar el vw hacía que el navegador pidiera
              // una versión de 1080 px para mostrarla a 176.
              sizes="(max-width: 1024px) 176px, 336px"
              className="relative w-[42vw] max-w-[11rem] object-contain lg:w-full lg:max-w-[21rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
