"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProfessor, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

export function ProfessorForm() {
  const [state, action, pending] = useActionState(createProfessor, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Nombre</span>
        <input name="name" required placeholder="Profe Seba" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Título</span>
        <input name="title" placeholder="Ingeniero Químico · Matemática" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Modalidad</span>
        <select name="modality" defaultValue="ambas" className={field}>
          <option value="ambas">Presencial y virtual</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">WhatsApp</span>
        <input name="whatsapp" placeholder="+54 9 299 ..." className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">
          Materias <span className="text-ink-mute">(una por línea)</span>
        </span>
        <textarea
          name="subjects"
          rows={3}
          placeholder={"Análisis Matemático I\nÁlgebra y Geometría I"}
          className={field}
        />
      </label>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
          {pending ? "Cargando…" : "Cargar como borrador"}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.ok && state.message && <p className="text-sm text-emerald-400">{state.message}</p>}
      </div>
    </form>
  );
}
