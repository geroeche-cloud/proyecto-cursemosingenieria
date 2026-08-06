"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";

const initial: ActionState = { ok: false };

/**
 * Form de acción destructiva: pide confirmación y muestra el resultado
 * (error o éxito) al lado del botón. La acción del servidor devuelve ActionState.
 */
export function DangerForm({
  action,
  hidden,
  confirm,
  label,
  className,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  hidden: Record<string, string>;
  confirm: string;
  label: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex items-center gap-2">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!window.confirm(confirm)) e.preventDefault();
        }}
        className={className}
      >
        {pending ? "Borrando…" : label}
      </button>
      {state.error && <span className="text-xs text-red-400">{state.error}</span>}
    </form>
  );
}
