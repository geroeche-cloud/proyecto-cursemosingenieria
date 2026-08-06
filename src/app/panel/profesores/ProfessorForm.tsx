"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createProfessor, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initial: ActionState = { ok: false };

export function ProfessorForm() {
  const [state, action, pending] = useActionState(createProfessor, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const [subjects, setSubjects] = useState<string[]>([""]);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setSubjects([""]);
    }
  }, [state]);

  const updateSubject = (i: number, v: string) =>
    setSubjects((prev) => prev.map((s, idx) => (idx === i ? v : s)));
  const addSubject = () => setSubjects((prev) => [...prev, ""]);
  const removeSubject = (i: number) =>
    setSubjects((prev) => (prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)));

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
        <span className="text-xs text-ink-soft">
          WhatsApp <span className="text-ink-mute">(mensaje directo)</span>
        </span>
        <input name="whatsapp" placeholder="+54 9 299 ..." className={field} />
      </label>

      {/* Materias: un input por materia, con "Añadir otra materia" */}
      <div className="flex flex-col gap-2 sm:col-span-2">
        <span className="text-xs text-ink-soft">Materias que da</span>
        {subjects.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              name="subjects"
              value={s}
              onChange={(e) => updateSubject(i, e.target.value)}
              placeholder={i === 0 ? "Análisis Matemático I" : "Otra materia…"}
              className={`${field} flex-1`}
            />
            {(subjects.length > 1 || s) && (
              <button
                type="button"
                onClick={() => removeSubject(i)}
                aria-label="Quitar materia"
                className="shrink-0 rounded-lg border border-hair px-2.5 py-2 text-xs text-ink-mute transition-colors hover:border-red-500/40 hover:text-red-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSubject}
          className="self-start text-xs font-medium text-blue-300 transition-colors hover:text-blue-200"
        >
          + Añadir otra materia
        </button>
      </div>

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
