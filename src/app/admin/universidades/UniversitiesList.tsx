"use client";

import { useMemo, useState } from "react";
import { DangerForm } from "../DangerForm";
import { setUniversityStatus, deleteUniversity } from "../actions";

export type UniRow = {
  id: string;
  name: string;
  short_name: string | null;
  city: string | null;
  status: string;
  embajador: string | null;
  publicaciones: number;
};

const field =
  "w-full rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

export function UniversitiesList({ universities }: { universities: UniRow[] }) {
  const [q, setQ] = useState("");

  const visibles = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return universities;
    return universities.filter((u) =>
      [u.name, u.short_name, u.city, u.embajador].some((v) => v?.toLowerCase().includes(s)),
    );
  }, [q, universities]);

  return (
    <div className="flex flex-col gap-4">
      {universities.length > 4 && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, sigla, ciudad o embajador…"
          className={field}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-hair">
        {visibles.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-mute">
            {universities.length === 0
              ? "Todavía no hay universidades."
              : "Ninguna universidad coincide con la búsqueda."}
          </p>
        ) : (
          <ul className="divide-y divide-hair">
            {visibles.map((u) => {
              const activa = u.status === "active";
              return (
                <li
                  key={u.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink break-anywhere">
                      {u.name}
                      {u.short_name ? <span className="text-ink-mute"> · {u.short_name}</span> : null}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-mute">
                      {u.city ?? "sin ciudad"} · {u.publicaciones} publicación
                      {u.publicaciones === 1 ? "" : "es"}
                      {u.embajador ? ` · ${u.embajador}` : " · sin embajador"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
                    <span
                      className={
                        activa
                          ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300"
                          : "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute"
                      }
                    >
                      {activa ? "Activa" : "Inactiva"}
                    </span>
                    <form action={setUniversityStatus}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="status" value={activa ? "inactive" : "active"} />
                      <button type="submit" className="btn btn-ghost text-xs">
                        {activa ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                    <DangerForm
                      action={deleteUniversity}
                      hidden={{ id: u.id }}
                      confirm={`¿Enviar "${u.name}" a la papelera? Deja de verse en el sitio junto con sus ${
                        u.publicaciones
                      } publicación${u.publicaciones === 1 ? "" : "es"}. Podés restaurarla desde la papelera.`}
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
