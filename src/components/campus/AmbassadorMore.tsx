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
        className="group chrome-edge sheen relative inline-flex w-full items-center justify-between gap-4 overflow-hidden rounded-full py-3.5 pl-5 pr-4 text-left transition-all duration-500 hover:-translate-y-0.5 sm:w-auto sm:gap-6"
        style={{
          background:
            "linear-gradient(150deg, rgba(59,107,255,0.22) 0%, rgba(20,27,45,0.9) 45%, rgba(10,14,26,0.95) 100%)",
          boxShadow:
            "0 18px 40px -22px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Resplandor azul que se enciende al pasar por encima */}
        <span
          className="pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(circle, rgba(59,107,255,0.8), transparent 70%)" }}
          aria-hidden
        />

        <span className="relative flex items-center gap-3">
          {/* Punto vivo: señala que hay más para ver */}
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${open ? "" : "pulse-dot"}`}
            style={{ background: "#9cb6ff", boxShadow: "0 0 10px 1px rgba(110,147,255,0.9)" }}
            aria-hidden
          />
          <span className="font-medium text-ink transition-colors duration-300 group-hover:text-white">
            {open ? "Ver menos" : `Conocé la trayectoria completa de ${firstName}`}
          </span>
        </span>

        {/* Flecha que gira al abrir */}
        <span
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-105"
          style={{
            background: "linear-gradient(158deg, rgba(59,107,255,0.45), rgba(26,58,168,0.2))",
            border: "1px solid rgba(120,150,255,0.45)",
          }}
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 text-blue-200 transition-transform duration-500 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
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
