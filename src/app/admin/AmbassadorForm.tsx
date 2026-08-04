"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAmbassador, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

export function AmbassadorForm({ universities }: { universities: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createAmbassador, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Nombre completo</span>
        <input name="full_name" placeholder="Gerónimo Echevarría" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Universidad</span>
        <select name="university_id" required defaultValue="" className={field}>
          <option value="" disabled>
            Elegí una universidad
          </option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Email</span>
        <input name="email" type="email" required placeholder="embajador@email.com" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Contraseña temporal</span>
        <input
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="mínimo 8 caracteres"
          className={field}
        />
      </label>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
          {pending ? "Creando…" : "Crear embajador"}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.ok && state.message && <p className="text-sm text-emerald-400">{state.message}</p>}
      </div>
    </form>
  );
}
