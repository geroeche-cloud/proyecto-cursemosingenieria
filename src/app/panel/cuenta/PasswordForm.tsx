"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 flex max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Nueva contraseña</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Al menos 8 caracteres"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Repetir contraseña</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={field}
        />
      </label>
      <div className="flex flex-col gap-2">
        <button type="submit" disabled={pending} className="btn btn-blue self-start text-sm disabled:opacity-60">
          {pending ? "Guardando…" : "Cambiar contraseña"}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.ok && state.message && <p className="text-sm text-emerald-400">{state.message}</p>}
      </div>
    </form>
  );
}
