import Image from "next/image";
import { IntroSonido } from "./IntroSonido";

/**
 * Intro de entrada — logo metálico con brillo azul y golpe cinematográfico.
 *
 * SERVER COMPONENT: cero JavaScript de React, cero librería de animación.
 *
 * POR QUÉ SE REHIZO
 * Esta pantalla tapaba el sitio entero durante 2 segundos y tardaba otros 0,85
 * en irse. Como Google mide cuándo aparece el contenido principal (LCP), el
 * sitio arrancaba con una nota de casi 3 segundos que ninguna otra
 * optimización podía compensar: el contenido estaba listo y escondido detrás
 * de una cortina. Además usaba `motion`, que traía la librería de animación
 * entera a TODAS las páginas del sitio.
 *
 * Ahora la cortina dura 1,2 s en total, se anima por CSS (opacity y transform,
 * las dos que resuelve la GPU) y no depende de que React hidrate para irse.
 * La estética es la misma; lo que cambió es que ya no bloquea la medición.
 *
 * El "una vez por sesión" lo resuelve un script de tres líneas en el <head>
 * (ver layout.tsx): corre ANTES de pintar, así quien ya la vio no ve ni un
 * parpadeo, sin que React tenga que intervenir.
 */
export function IntroLoader() {
  return (
    <div className="intro brushed-metal" aria-hidden>
      <div className="intro-glow" />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative flex flex-col items-center">
        <div className="intro-logo">
          <Image
            src="/images/cursemos-logo.png"
            alt=""
            width={896}
            height={667}
            priority
            // Sin `unoptimized`: antes se servía el PNG crudo de 342 KB, y es
            // justo la imagen que el navegador pinta primero. Next la entrega
            // en AVIF/WebP al tamaño que pide cada pantalla.
            quality={90}
            sizes="(max-width: 640px) 240px, 320px"
            className="h-auto w-60 sm:w-80"
          />
        </div>
        <div className="metal-divider intro-linea mt-7 w-40 origin-center sm:w-52" />
        <span className="intro-sello mt-5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ink-mute">
          Est. 2026
        </span>
      </div>

      <IntroSonido />
    </div>
  );
}
