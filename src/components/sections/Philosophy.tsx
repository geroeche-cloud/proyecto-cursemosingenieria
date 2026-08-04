import { Reveal } from "@/components/ui/Reveal";
import { AmbientLights } from "@/components/ui/AmbientLights";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PHILOSOPHY, VALUES, PILLARS } from "@/lib/org";

export function Philosophy() {
  return (
    <section id="filosofia" className="relative overflow-hidden py-28 sm:py-36">
      <AmbientLights variant="subtle" />
      <div className="shell relative z-10">
        <SectionLabel eyebrow={PHILOSOPHY.eyebrow} title={PHILOSOPHY.title} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PHILOSOPHY.principles.map((p, i) => (
            <Reveal key={p.title} delay={0.05 * i}>
              <div className="glass lift h-full rounded-3xl p-7">
                <span className="font-mono text-xs text-blue-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold leading-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Values band */}
        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center">
            {VALUES.map((v) => (
              <span
                key={v}
                className="font-display text-lg font-semibold text-ti tracking-tight sm:text-2xl"
              >
                {v}
                <span className="mx-1 text-ink-faint">·</span>
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 flex items-center justify-center gap-3">
            {PILLARS.map((p) => (
              <span
                key={p}
                className="chip rounded-full px-5 py-2 font-mono text-xs font-medium uppercase tracking-[0.2em] text-ti-100"
              >
                {p}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
