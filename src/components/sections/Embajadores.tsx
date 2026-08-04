import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { AmbientLights } from "@/components/ui/AmbientLights";
import { AMBASSADORS } from "@/lib/campus";
import { getUniversity } from "@/lib/academy";

/**
 * "Conocé a los embajadores" — presentaciones de quienes construyen la red en
 * cada universidad. Preview en la home; el perfil completo vive en /embajadores.
 * Estructura lista para escalar a más universidades.
 */
export function Embajadores() {
  const ambassadors = Object.values(AMBASSADORS);

  return (
    <section id="embajadores" className="relative overflow-hidden py-24 sm:py-32">
      <AmbientLights variant="blue" />
      <div className="shell relative z-10">
        <Reveal>
          <h2 className="flex items-center gap-4 font-display text-[length:var(--text-h3)] font-semibold tracking-tight text-ink">
            <span className="metal-tick" />
            Conocé a los embajadores
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-col gap-16">
          {ambassadors.map((a) => {
            const uni = getUniversity(a.universityId);
            return (
              <Reveal key={a.universityId}>
                <article className="grid items-center gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-12">
                  {/* Fotografía */}
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-3xl border border-hair-strong chrome-edge lg:mx-0">
                    <Image
                      src={a.photo}
                      alt={a.name}
                      fill
                      sizes="(max-width: 1024px) 320px, 320px"
                      className="object-cover object-[50%_18%]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg/60 to-transparent" />
                  </div>

                  {/* Información */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <span className="eyebrow flex items-center gap-3">
                        <span className="metal-tick" />
                        {uni?.name}
                      </span>
                      <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                        {a.name}
                      </h3>
                      <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-ink-mute">
                        {a.role} · {a.career}
                      </p>
                    </div>

                    <p className="max-w-2xl leading-relaxed text-ink-soft">{a.bio}</p>

                    {/* Etiquetas visuales */}
                    <div className="flex flex-wrap gap-2">
                      {a.tags.map((t) => (
                        <span
                          key={t}
                          className="chip rounded-full px-3 py-1.5 text-xs font-medium text-ti-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Redes — plata */}
                    <div className="flex flex-wrap gap-2.5">
                      {a.socials.map((s) => {
                        const external = !s.href.startsWith("mailto");
                        return (
                          <a
                            key={s.label}
                            href={s.href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noopener noreferrer" : undefined}
                            className="chip rounded-full px-3.5 py-1.5 text-sm font-medium text-ti-100 transition-colors hover:text-white"
                          >
                            {s.label}
                          </a>
                        );
                      })}
                    </div>

                    <div>
                      <Link href="/embajadores" className="btn btn-blue">
                        Conocer trayectoria completa
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Expansión a otras universidades */}
        <Reveal delay={0.1}>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl border border-hair-strong p-7 text-center"
                style={{ borderStyle: "dashed" }}
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-mute">
                  Universidad
                </span>
                <p className="font-display text-sm font-medium text-ink-faint">
                  Próximo embajador
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
