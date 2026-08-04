import Image from "next/image";
import { type Ambassador } from "@/lib/campus";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

/**
 * Sección integrada del embajador (no una tarjeta flotante): presentación
 * resumida. Cada embajador tendrá luego su página en "Equipo de embajadores".
 */
export function AmbassadorCard({
  ambassador,
  universityName,
}: {
  ambassador: Ambassador;
  universityName: string;
}) {
  const contact = `mailto:${ambassador.email}?subject=${encodeURIComponent(
    "Contacto — Embajador de Cursemos Ingeniería"
  )}`;

  return (
    <section>
      <span className="eyebrow flex items-center gap-3">
        <span className="metal-tick" />
        Representación oficial
      </span>
      <h2 className="mt-4 max-w-4xl font-display text-[length:var(--text-h3)] font-semibold leading-tight text-ink">
        Embajador de Cursemos Ingeniería en la {universityName}
      </h2>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-12">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-3xl border border-hair-strong chrome-edge lg:mx-0">
          <Image
            src={ambassador.photo}
            alt={ambassador.name}
            fill
            sizes="(max-width: 1024px) 320px, 320px"
            className="object-cover object-[50%_20%]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg/60 to-transparent" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {ambassador.name}
            </h3>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-ti-500">
              {ambassador.role} · {ambassador.career}
            </p>
          </div>

          <p className="max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {ambassador.bio}
          </p>

          <div>
            <a href={contact} className="btn btn-blue">
              <MailIcon />
              Contactar embajador
            </a>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {ambassador.socials.map((s) => {
              const external = !s.href.startsWith("mailto");
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="chip rounded-full px-4 py-2 text-sm font-medium text-ti-100 transition-colors hover:text-white"
                >
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
