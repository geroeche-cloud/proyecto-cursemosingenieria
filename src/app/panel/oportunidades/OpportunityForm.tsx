"use client";

import { useActionState, useEffect, useRef } from "react";
import { createOpportunity, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

export function OpportunityForm() {
  const [state, action, pending] = useActionState(createOpportunity, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Tipo</span>
        <select name="kind" defaultValue="beca" className={field}>
          <option value="beca">Beca</option>
          <option value="pasantia">Pasantía</option>
          <option value="programa">Programa</option>
          <option value="evento">Evento</option>
          <option value="competencia">Competencia</option>
          <option value="noticia">Noticia</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Organización</span>
        <input name="org" placeholder="Fundación Roberto Rocca" className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">Título</span>
        <input name="title" required placeholder="Beca Roberto Rocca" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Fecha límite</span>
        <input name="deadline" placeholder="Inscripción hasta el 30/09" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Link de postulación</span>
        <input name="href" type="url" placeholder="https://…" className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">Descripción</span>
        <textarea name="description" rows={2} className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">
          Requisitos excluyentes <span className="text-ink-mute">(uno por línea)</span>
        </span>
        <textarea
          name="requirements"
          rows={3}
          placeholder={"Estudiante regular de ingeniería\nPromedio académico destacado"}
          className={field}
        />
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
            {pending ? "Guardando…" : "Crear y publicar"}
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
