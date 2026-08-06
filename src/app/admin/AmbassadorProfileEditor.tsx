"use client";

import { useActionState, useEffect, useState } from "react";
import { saveAmbassadorProfile, type ActionState } from "./actions";

export type ProfileRow = {
  university_id: string;
  university_name: string;
  ambassador_name: string | null;
  display_name: string | null;
  presentation: string | null;
  bio: string | null;
  photo_url: string | null;
  trajectory: { year: string; text: string }[];
};

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

function trajectoryToText(items: { year: string; text: string }[]): string {
  return items.map((i) => (i.year ? `${i.year} | ${i.text}` : i.text)).join("\n");
}

export function AmbassadorProfileEditor({ profiles }: { profiles: ProfileRow[] }) {
  const [state, action, pending] = useActionState(saveAmbassadorProfile, initial);
  const [selectedId, setSelectedId] = useState(profiles[0]?.university_id ?? "");

  // Al guardar bien, limpiamos el mensaje si el admin cambia de universidad.
  useEffect(() => {
    // no-op: el mensaje se muestra hasta el próximo submit.
  }, [state]);

  if (profiles.length === 0) {
    return (
      <p className="mt-4 text-sm text-ink-mute">
        Cuando crees un embajador vas a poder editar acá su perfil público.
      </p>
    );
  }

  const selected = profiles.find((p) => p.university_id === selectedId) ?? profiles[0];

  return (
    <div className="mt-4 rounded-2xl border border-hair p-5">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Universidad</span>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className={field}
        >
          {profiles.map((p) => (
            <option key={p.university_id} value={p.university_id}>
              {p.university_name}
              {p.ambassador_name ? ` · ${p.ambassador_name}` : ""}
            </option>
          ))}
        </select>
      </label>

      {/* key => al cambiar de universidad, los campos se recargan con sus valores */}
      <form key={selected.university_id} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="university_id" value={selected.university_id} />

        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">Nombre a mostrar</span>
          <input
            name="display_name"
            defaultValue={selected.display_name ?? selected.ambassador_name ?? ""}
            placeholder="Gerónimo Echevarría"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">Presentación (una línea)</span>
          <input
            name="presentation"
            defaultValue={selected.presentation ?? ""}
            placeholder="Embajador · Ingeniería en Petróleo"
            className={field}
          />
        </label>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-xs text-ink-soft">Foto del embajador</span>
          <input type="hidden" name="current_photo_url" value={selected.photo_url ?? ""} />
          <div className="flex items-center gap-4">
            {selected.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.photo_url}
                alt="Foto actual"
                className="h-16 w-16 rounded-xl object-cover"
                style={{ border: "1px solid rgba(255,255,255,0.14)" }}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-hair text-xs text-ink-mute">
                Sin foto
              </div>
            )}
            <input
              name="photo_file"
              type="file"
              accept="image/*"
              className="text-xs text-ink-soft file:mr-3 file:rounded-lg file:border file:border-hair-strong file:bg-surface file:px-3 file:py-1.5 file:text-xs file:text-ink"
            />
          </div>
          {selected.photo_url && (
            <label className="flex items-center gap-2 text-xs text-ink-mute">
              <input type="checkbox" name="remove_photo" /> Quitar la foto actual
            </label>
          )}
          <p className="text-[0.68rem] text-ink-mute">JPG o PNG, hasta 5 MB. Se guarda en Supabase Storage.</p>
        </div>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-ink-soft">Bio / visión</span>
          <textarea
            name="bio"
            rows={4}
            defaultValue={selected.bio ?? ""}
            placeholder="Su historia, su rol y hacia dónde va la comunidad en esta universidad."
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-ink-soft">
            Trayectoria <span className="text-ink-mute">(una por línea, formato: AÑO | hito)</span>
          </span>
          <textarea
            name="trajectory"
            rows={5}
            defaultValue={trajectoryToText(selected.trajectory)}
            placeholder={"2024 | Fundé la comunidad en la facultad\n2023 | Beca Roberto Rocca"}
            className={field}
          />
        </label>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <button type="submit" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
            {pending ? "Guardando…" : "Guardar perfil"}
          </button>
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state.ok && state.message && <p className="text-sm text-emerald-400">{state.message}</p>}
        </div>
      </form>
    </div>
  );
}
