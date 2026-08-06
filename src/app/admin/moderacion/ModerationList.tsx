"use client";

import { useMemo, useState } from "react";
import { DangerForm } from "../DangerForm";
import { unpublishContent, deleteContent } from "../actions";

export type ModRow = {
  tabla: "news" | "opportunities" | "professors" | "drives";
  tipo: string;
  id: string;
  label: string;
  universidad: string;
  clicks: number;
};

const field =
  "w-full rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const FILTROS = [
  { k: "todo", label: "Todo" },
  { k: "news", label: "Noticias" },
  { k: "opportunities", label: "Oportunidades" },
  { k: "professors", label: "Profesores" },
  { k: "drives", label: "Drives" },
] as const;

export function ModerationList({ items }: { items: ModRow[] }) {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<string>("todo");

  const visibles = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((m) => {
      if (tipo !== "todo" && m.tabla !== tipo) return false;
      if (!s) return true;
      return [m.label, m.universidad, m.tipo].some((v) => v.toLowerCase().includes(s));
    });
  }, [q, tipo, items]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar publicación o universidad…"
          className={field}
        />
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.k}
              type="button"
              onClick={() => setTipo(f.k)}
              className={`rounded-full px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] transition-colors ${
                tipo === f.k
                  ? "border border-blue-500/50 bg-blue-500/15 text-blue-200"
                  : "border border-hair text-ink-mute hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hair">
        {visibles.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-mute">
            {items.length === 0
              ? "Todavía no hay contenido publicado."
              : "Nada coincide con el filtro."}
          </p>
        ) : (
          <ul className="divide-y divide-hair">
            {visibles.map((m) => (
              <li
                key={`${m.tabla}-${m.id}`}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink break-anywhere">{m.label}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-mute">
                    {m.tipo} · {m.universidad} · {m.clicks} clic{m.clicks === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <form action={unpublishContent}>
                    <input type="hidden" name="table" value={m.tabla} />
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="btn btn-ghost text-xs text-amber-300">
                      Despublicar
                    </button>
                  </form>
                  <DangerForm
                    action={deleteContent}
                    hidden={{ table: m.tabla, id: m.id }}
                    confirm="¿Borrar esta publicación definitivamente? Esta acción no se puede deshacer."
                    label="Borrar"
                    className="btn btn-ghost text-xs text-red-300"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">
        {visibles.length} de {items.length} publicaciones
      </p>
    </div>
  );
}
