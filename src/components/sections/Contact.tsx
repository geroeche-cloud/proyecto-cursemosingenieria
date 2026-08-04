import { Reveal } from "@/components/ui/Reveal";
import { AmbientLights } from "@/components/ui/AmbientLights";
import { SOCIAL_ICON } from "@/components/ui/SocialIcon";
import { ORG, SOCIALS } from "@/lib/org";

const RECORD = [
  ["Organización", ORG.name],
  ["Fundador", ORG.founder],
  ["Establecida", ORG.established],
  ["Ubicación", ORG.location],
] as const;

export function Contact() {
  return (
    <section id="contacto" className="relative overflow-hidden py-28 sm:py-40">
      <AmbientLights variant="blue" />
      <div className="shell relative z-10">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-20">
          <div>
            <Reveal>
              <span className="eyebrow flex items-center gap-3">
                <span className="metal-tick" />
                06 — Contacto institucional
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-7 font-display text-[length:var(--text-h1)] font-bold leading-[0.98] tracking-tight text-ink">
                Construyamos algo que dure.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
                La conversación siempre está abierta.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <a href={`mailto:${ORG.email}`} className="btn btn-metal mt-9">
                {ORG.email}
              </a>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="lift flex h-11 w-11 items-center justify-center rounded-full border border-hair-strong bg-white/[0.03] text-ink-soft transition-colors hover:border-blue-500/40 hover:text-blue-300"
                  >
                    {SOCIAL_ICON[s.id]}
                  </a>
                ))}
                <a
                  href={`mailto:${ORG.email}`}
                  aria-label="Email"
                  className="lift flex h-11 w-11 items-center justify-center rounded-full border border-hair-strong bg-white/[0.03] text-ink-soft transition-colors hover:border-blue-500/40 hover:text-blue-300"
                >
                  {SOCIAL_ICON.mail}
                </a>
              </div>
            </Reveal>
          </div>

          {/* Record card — light titanium surface */}
          <Reveal delay={0.1}>
            <div className="panel-ti rounded-3xl p-8 sm:p-10">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] muted">
                Registro
              </span>
              <dl className="mt-6 flex flex-col">
                {RECORD.map(([k, v]) => (
                  <div
                    key={k}
                    className="line flex items-center justify-between gap-4 border-b py-3.5 last:border-0"
                  >
                    <dt className="font-mono text-xs uppercase tracking-[0.14em] muted">{k}</dt>
                    <dd className="text-right text-sm font-semibold text-[#0d1016]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
