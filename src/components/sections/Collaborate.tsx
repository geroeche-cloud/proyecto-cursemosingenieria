"use client";

import { useState } from "react";
import { AmbientLights } from "@/components/ui/AmbientLights";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TRACKS } from "@/lib/collaborate";
import { ORG } from "@/lib/org";
import { cn } from "@/lib/cn";

export function Collaborate() {
  const [active, setActive] = useState(0);
  const track = TRACKS[active];
  const mail = `mailto:${ORG.email}?subject=${encodeURIComponent(
    track.mailSubject
  )}&body=${encodeURIComponent(track.mailBody)}`;

  return (
    <section id="colaborar" className="relative overflow-hidden py-28 sm:py-36">
      <AmbientLights variant="blue" />
      <div className="shell relative z-10">
        <SectionLabel
          eyebrow="Colaborar"
          title="Todos pueden sumarse"
          lead="Nada grande se construye solo."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Track selector */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {TRACKS.map((tr, i) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={cn(
                  "rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-300",
                  active === i
                    ? "chip border-transparent text-ti-50"
                    : "border-hair bg-white/[0.02] text-ink-soft hover:border-hair-strong hover:text-ink"
                )}
              >
                {tr.label}
              </button>
            ))}
          </div>

          {/* Active track panel */}
          <div className="glass-lux chrome-edge relative min-h-[18rem] overflow-hidden rounded-3xl p-8 sm:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-60 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(59,107,255,0.35), transparent 70%)" }}
              aria-hidden
            />
            {/* Al cambiar la pestaña cambia la key: React vuelve a montar el
                bloque y la animación CSS se reproduce sola. Es lo que hacía
                AnimatePresence, sin librería. */}
            <div key={track.id} className="cambio-pestana relative flex h-full flex-col">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-blue-300">
                  {track.label}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  {track.headline}
                </h3>
                <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">{track.body}</p>
                <div className="mt-auto pt-8">
                  <a href={mail} className="btn btn-metal text-sm">
                    {track.cta}
                  </a>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
