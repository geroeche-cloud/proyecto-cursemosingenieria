import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { AmbientLights } from "@/components/ui/AmbientLights";

/** Concepto clave — plateado metálico. */
function K({ children }: { children: ReactNode }) {
  return <span className="text-ti font-semibold">{children}</span>;
}

/** Pasaje de lectura (cuerpo). */
function Passage({ children }: { children: ReactNode }) {
  return (
    <Reveal>
      <p className="text-[length:var(--text-lead)] leading-relaxed text-ink-soft">{children}</p>
    </Reveal>
  );
}

/** Frase clave — metálica, con acento lateral. */
function Line({ children }: { children: ReactNode }) {
  return (
    <Reveal>
      <p className="border-l-2 border-blue-500/50 pl-5 font-display text-xl font-semibold leading-snug text-ti sm:pl-6 sm:text-2xl">
        {children}
      </p>
    </Reveal>
  );
}

/**
 * "La visión" — manifiesto de Cursemos Ingeniería.
 * Documento a todo el ancho, alineado a la izquierda, jerarquía sobria. Texto exacto.
 */
export function Vision() {
  return (
    <section id="vision" className="relative overflow-hidden py-24 sm:py-32">
      <AmbientLights variant="blue" />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="shell relative z-10">
        <div className="flex flex-col gap-6 sm:gap-7">
          {/* Encabezado */}
          <div className="mb-1 flex flex-col gap-4">
            <Reveal>
              <span className="eyebrow flex items-center gap-3">
                <span className="metal-tick" />
                La visión
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-[length:var(--text-h3)] font-bold leading-[1.1] tracking-tight text-ink">
                Creemos que el talento está en todas partes y que el futuro no se
                espera:{" "}
                <span className="text-ti animate-shimmer">se construye.</span>
              </h2>
            </Reveal>
          </div>

          <Passage><K>Cursemos Ingeniería</K> nace para conectar estudiantes, universidades y empresas en una red capaz de transformar el potencial en <K>oportunidades reales</K>.</Passage>

          <Passage>Queremos impulsar una generación que no solo domine conocimientos técnicos, sino que también <K>lidere</K>, <K>innove</K>, <K>cree</K> y se anime a <K>cambiar el mundo</K>.</Passage>

          <Line>Porque las grandes transformaciones comienzan cuando las personas se unen para construir algo mejor.</Line>

          {/* Cierre */}
          <Reveal delay={0.05}>
            <p className="font-display text-[length:var(--text-h3)] font-bold leading-[1.1] tracking-tight text-ti animate-shimmer">
              Y el futuro empieza hoy.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
