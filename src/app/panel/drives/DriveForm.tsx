"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDrive, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

export function DriveForm() {
  const [state, action, pending] = useActionState(createDrive, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">De quién es el drive</span>
        <input name="owner" required placeholder="Martina Gómez" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Carrera</span>
        <input name="career" placeholder="Ingeniería en Petróleo" className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">Link del Google Drive</span>
        <input name="href" type="url" placeholder="https://drive.google.com/..." className={field} />
      </label>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className="btn btn-blue text-sm disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Cargar y publicar"}
          </button>
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="btn btn-ghost text-sm disabled:opacity-60"
          >
            Guardar como borrador
          </button>
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.ok && state.message && <p className="text-sm text-emerald-400">{state.message}</p>}
      </div>
    </form>
  );
}
