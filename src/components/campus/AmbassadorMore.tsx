"use client";

import { useState } from "react";

type Group = { year: string; items: { title: string; detail: string }[] };

/**
 * Bloque desplegable del perfil del embajador: al pulsar "conocé la trayectoria
 * completa" muestra la biografía completa y la línea de tiempo.
 */
export function AmbassadorMore({
  name,
  bioFull,
  groups,
}: {
  name: string;
  bioFull: string | null;
  groups: Group[];
}) {
  const [open, setOpen] = useState(false);

  if (!bioFull && groups.length === 0) return null;

  const firstName = name?.split(/\s+/)[0] || "el embajador";

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="btn btn-ghost text-sm"
      >
        {open ? "Ver menos" : `Conocé la trayectoria completa de ${firstName}`}
      </button>

      {open && (
        <div className="mt-6 flex flex-col gap-10 border-t border-hair pt-6">
          {bioFull && (
            <div className="flex max-w-2xl flex-col gap-4">
              {bioFull.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </div>
          )}

          {groups.length > 0 && (
            <div>
              <p className="eyebrow mb-5 flex items-center gap-3">
                <span className="metal-tick" />
                Trayectoria
              </p>
              <div className="flex flex-col gap-8">
                {groups.map((g) => (
                  <div key={g.year} className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                    <span className="font-display text-3xl font-bold leading-none text-ti-500 sm:w-24 sm:shrink-0">
                      {g.year}
                    </span>
                    <div className="flex flex-col gap-4">
                      {g.items.map((it, i) => (
                        <div key={i}>
                          <h4 className="font-display text-base font-semibold leading-snug text-ink">
                            {it.title}
                          </h4>
                          {it.detail && (
                            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{it.detail}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
