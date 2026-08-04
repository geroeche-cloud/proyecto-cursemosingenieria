"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUniversity, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

export function UniversityForm() {
  const [state, action, pending] = useActionState(createUniversity, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-ink-soft">Nombre</span>
          <input name="name" required placeholder="Universidad Nacional del Comahue" className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">Sigla</span>
          <input name="short_name" placeholder="UNCo" className={`${field} w-28`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-soft">Ciudad</span>
          <input name="city" placeholder="Neuquén" className={`${field} w-36`} />
        </label>
        <button type="submit" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
          {pending ? "Creando…" : "Crear universidad"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.ok && state.message && <p className="text-sm text-emerald-400">{state.message}</p>}
    </form>
  );
}
