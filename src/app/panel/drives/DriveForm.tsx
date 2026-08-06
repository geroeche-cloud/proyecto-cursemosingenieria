"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createDrive, updateDrive, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initialState: ActionState = { ok: false };

export type DriveInitial = { id: string; owner: string; career: string | null; href: string | null };

export function DriveForm({ initial }: { initial?: DriveInitial }) {
  const isEdit = !!initial;
  const router = useRouter();
  const [state, action, pending] = useActionState(isEdit ? updateDrive : createDrive, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    if (isEdit) router.push("/panel/drives");
    else formRef.current?.reset();
  }, [state, isEdit, router]);

  return (
    <form ref={formRef} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">De quién es el drive</span>
        <input name="owner" required defaultValue={initial?.owner ?? ""} placeholder="Martina Gómez" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Carrera</span>
        <input name="career" defaultValue={initial?.career ?? ""} placeholder="Ingeniería en Petróleo" className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">Link del Google Drive</span>
        <input name="href" type="url" defaultValue={initial?.href ?? ""} placeholder="https://drive.google.com/..." className={field} />
      </label>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <div className="flex flex-wrap gap-2">
          {isEdit ? (
            <button type="submit" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          ) : (
            <>
              <button type="submit" name="intent" value="publish" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
                {pending ? "Guardando…" : "Cargar y publicar"}
              </button>
              <button type="submit" name="intent" value="draft" disabled={pending} className="btn btn-ghost text-sm disabled:opacity-60">
                Guardar como borrador
              </button>
            </>
          )}
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.ok && state.message && <p className="text-sm text-emerald-400">{state.message}</p>}
      </div>
    </form>
  );
}
