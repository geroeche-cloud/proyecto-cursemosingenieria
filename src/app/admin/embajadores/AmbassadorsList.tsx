"use client";

import { useMemo, useState } from "react";
import { DangerForm } from "../DangerForm";
import { setAmbassadorStatus, deleteAmbassador } from "../actions";

export type AmbRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  status: string;
  universidad: string | null;
  publicaciones: number;
};

const field =
  "w-full rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

export function AmbassadorsList({ ambassadors }: { ambassadors: AmbRow[] }) {
  const [q, setQ] = useState("");

  const visibles = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ambassadors;
    return ambassadors.filter((a) =>
      [a.full_name, a.email, a.universidad].some((v) => v?.toLowerCase().includes(s)),
    );
  }, [q, ambassadors]);

  return (
    <div className="flex flex-col gap-4">
      {ambassadors.length > 4 && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, email o universidad…"
          className={field}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-hair">
        {visibles.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-mute">
            {ambassadors.length === 0
              ? "Todavía no hay embajadores."
              : "Ningún embajador coincide con la búsqueda."}
          </p>
        ) : (
          <ul className="divide-y divide-hair">
            {visibles.map((a) => {
              const activo = a.status === "active";
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink break-anywhere">
                      {a.full_name || "Sin nombre"}
                    </p>
                    <p className="font-mono text-xs text-ink-mute break-anywhere">{a.email}</p>
                    <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">
                      {a.publicaciones} publicación{a.publicaciones === 1 ? "" : "es"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
                    <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-blue-300">
                      {a.universidad ?? "sin asignar"}
                    </span>
                    {!activo && (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-amber-300">
                        Suspendido
                      </span>
                    )}
                    <form action={setAmbassadorStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value={activo ? "suspended" : "active"} />
                      <button
                        type="submit"
                        className={
                          activo
                            ? "btn btn-ghost text-xs text-amber-300"
                            : "btn btn-ghost text-xs text-emerald-300"
                        }
                      >
                        {activo ? "Suspender" : "Reactivar"}
                      </button>
                    </form>
                    <DangerForm
                      action={deleteAmbassador}
                      hidden={{ id: a.id }}
                      confirm={`¿Borrar la cuenta de ${
                        a.full_name || a.email || "este embajador"
                      }? No podrá volver a ingresar. Sus publicaciones quedan, pero sin autor. Esta acción no se puede deshacer.`}
                      label="Borrar"
                      className="btn btn-ghost text-xs text-red-300"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
