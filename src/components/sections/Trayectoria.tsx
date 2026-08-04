import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TIMELINE, TIMELINE_YEARS, KIND_LABEL, SKILLS, NEXT_OBJECTIVES } from "@/lib/journey";
import { cn } from "@/lib/cn";

const NODE: Record<string, string> = {
  hecho: "bg-emerald-400 border-emerald-400/40",
  presente: "bg-blue-400 border-blue-400/50 pulse-dot",
  futuro: "bg-transparent border-ti-500",
};

export function Trayectoria() {
  return (
    <section id="trayectoria" className="section-raised relative py-28 sm:py-36">
      <div className="shell">
        <SectionLabel
          eyebrow="03 — Trayectoria"
          title="El camino, en tiempo real"
          lead="Un paso a la vez. Todo queda registrado."
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.55fr_1fr] lg:gap-20">
          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute left-[calc(5rem+5px)] top-3 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-emerald-400/40 via-hair-strong to-transparent sm:block"
              aria-hidden
            />
            <div className="flex flex-col gap-14">
              {TIMELINE_YEARS.map((year) => {
                const items = TIMELINE.filter((t) => t.year === year);
                const future = items[0]?.state === "futuro";
                return (
                  <Reveal key={year}>
                    <div className="flex flex-col gap-5 sm:flex-row sm:gap-0">
                      {/* Year marker */}
                      <div className="sm:w-20 sm:shrink-0">
                        <span
                          className={cn(
                            "font-display text-2xl font-bold tracking-tight sm:text-3xl",
                            future ? "text-ti-500" : "text-ti"
                          )}
                        >
                          {year}
                        </span>
                      </div>
                      {/* Items */}
                      <div className="flex flex-1 flex-col gap-3 sm:pl-10">
                        {items.map((t) => (
                          <div
                            key={t.title}
                            className={cn(
                              "relative rounded-2xl border p-5 transition-all duration-500 sm:p-6",
                              t.state === "futuro"
                                ? "border-dashed border-hair-strong bg-transparent"
                                : "glass-bright lift"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute -left-[calc(2.5rem+1px)] top-7 hidden h-3 w-3 rounded-full border sm:block",
                                NODE[t.state]
                              )}
                              aria-hidden
                            />
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-blue-300">
                                {KIND_LABEL[t.kind]}
                              </span>
                              {t.state === "futuro" && (
                                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-mute">
                                  Próximo
                                </span>
                              )}
                            </div>
                            <h3 className={cn("mt-2 font-display text-lg font-semibold leading-snug", t.state === "futuro" ? "text-ink-soft" : "text-ink")}>
                              {t.title}
                            </h3>
                            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
                              {t.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Aside */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="panel-ti rounded-3xl p-7">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] muted">
                  Habilidades
                </span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SKILLS.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-black/10 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-[#1a1f29]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="glass-bright rounded-3xl p-7">
                <span className="eyebrow">Próximos objetivos</span>
                <ul className="mt-4 flex flex-col gap-3">
                  {NEXT_OBJECTIVES.map((o) => (
                    <li key={o} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
