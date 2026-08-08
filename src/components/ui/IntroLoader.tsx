import Image from "next/image";

/**
 * Intro de entrada — logo metálico con brillo azul.
 *
 * SERVER COMPONENT: cero JavaScript. Ni React, ni librerías, ni audio.
 *
 * SE QUITÓ EL SONIDO, a propósito. Los navegadores bloquean el audio hasta que
 * la persona toca algo, así que el golpe nunca sonaba con la intro: quedaba
 * esperando y se disparaba en el primer clic, que normalmente es el botón de
 * Campus. El resultado era un sonido de bienvenida sonando al entrar a otra
 * sección: se leía como una falla, no como un efecto. Además arrastraba un
 * contexto de audio y la generación de 88.000 muestras de ruido.
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
            // Carga inmediata pero en PRIORIDAD BAJA. Con `priority` competía
            // por el ancho de banda contra la tipografía del titular, que es
            // el elemento que Google cronometra. Esta imagen es decorativa y
            // vive 0,75 s; el titular es el contenido.
            loading="eager"
            fetchPriority="low"
            // Sin `unoptimized`: antes se servía el PNG crudo de 342 KB.
            quality={85}
            sizes="(max-width: 640px) 240px, 320px"
            className="h-auto w-60 sm:w-80"
          />
        </div>
        <div className="metal-divider intro-linea mt-7 w-40 origin-center sm:w-52" />
        <span className="intro-sello mt-5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ink-mute">
          Est. 2026
        </span>
      </div>
    </div>
  );
}
