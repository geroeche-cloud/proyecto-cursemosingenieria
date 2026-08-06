"use client";

import { useActionState, useState } from "react";
import { saveAmbassadorProfile, type ActionState } from "./actions";

export type TrajItem = { year: string; title: string; detail: string };

export type ProfileRow = {
  university_id: string;
  university_name: string;
  ambassador_name: string | null;
  display_name: string | null;
  presentation: string | null;
  bio: string | null;
  bio_full: string | null;
  photo_url: string | null;
  email: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  linkedin: string | null;
  trajectory: TrajItem[];
};

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };
const BIO_MAX = 240;

function trajectoryToText(items: TrajItem[]): string {
  return items
    .map((i) => [i.year, i.title, i.detail].filter(Boolean).join(" | "))
    .join("\n");
}

export function AmbassadorProfileEditor({ profiles }: { profiles: ProfileRow[] }) {
  const [state, action, pending] = useActionState(saveAmbassadorProfile, initial);
  const [selectedId, setSelectedId] = useState(profiles[0]?.university_id ?? "");

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
            placeholder="Fundador de Cursemos Ingeniería · Embajador UNCo"
            className={field}
          />
        </label>

        {/* Foto */}
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

        {/* Bio corta + completa */}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-ink-soft">
            Bio corta <span className="text-ink-mute">(máx. {BIO_MAX} caracteres · se ve siempre)</span>
          </span>
          <textarea
            name="bio"
            rows={3}
            maxLength={BIO_MAX}
            defaultValue={selected.bio ?? ""}
            placeholder="Una línea o dos que lo presenten."
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-ink-soft">
            Bio completa <span className="text-ink-mute">(se ve al “conocer la trayectoria completa”; separá párrafos con un renglón en blanco)</span>
          </span>
          <textarea
            name="bio_full"
            rows={6}
            defaultValue={selected.bio_full ?? ""}
            placeholder={"Su historia y su propósito.\n\nSu visión hacia adelante."}
            className={field}
          />
        </label>

        {/* Redes */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">Mail</span>
          <input name="email" defaultValue={selected.email ?? ""} placeholder="nombre@mail.com" className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">Instagram (URL)</span>
          <input name="instagram" defaultValue={selected.instagram ?? ""} placeholder="https://instagram.com/…" className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">TikTok (URL)</span>
          <input name="tiktok" defaultValue={selected.tiktok ?? ""} placeholder="https://tiktok.com/@…" className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">YouTube (URL)</span>
          <input name="youtube" defaultValue={selected.youtube ?? ""} placeholder="https://youtube.com/@…" className={field} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-ink-soft">LinkedIn (URL)</span>
          <input name="linkedin" defaultValue={selected.linkedin ?? ""} placeholder="https://linkedin.com/in/…" className={field} />
        </label>

        {/* Trayectoria */}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-ink-soft">
            Trayectoria{" "}
            <span className="text-ink-mute">(una por línea, formato: AÑO | título | detalle)</span>
          </span>
          <textarea
            name="trajectory"
            rows={6}
            defaultValue={trajectoryToText(selected.trajectory)}
            placeholder={
              "2026 | Fundación de Cursemos Ingeniería | Una red que conecta estudiantes y oportunidades\n2025 | Programa de Becarios Roberto Rocca | Desarrollo académico y profesional"
            }
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
