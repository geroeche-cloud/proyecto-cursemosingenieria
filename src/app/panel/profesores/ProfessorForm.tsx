"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProfessor, updateProfessor, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initialState: ActionState = { ok: false };

export type ProfessorInitial = {
  id: string;
  name: string;
  title: string | null;
  modality: string;
  whatsapp: string | null;
  subjects: string[] | null;
};

export function ProfessorForm({ initial }: { initial?: ProfessorInitial }) {
  const isEdit = !!initial;
  const router = useRouter();
  const [state, action, pending] = useActionState(
    isEdit ? updateProfessor : createProfessor,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [subjects, setSubjects] = useState<string[]>(
    initial?.subjects && initial.subjects.length > 0 ? initial.subjects : [""],
  );

  useEffect(() => {
    if (!state.ok) return;
    if (isEdit) router.push("/panel/profesores");
    else {
      formRef.current?.reset();
      setSubjects([""]);
    }
  }, [state, isEdit, router]);

  const updateSubject = (i: number, v: string) =>
    setSubjects((prev) => prev.map((s, idx) => (idx === i ? v : s)));
  const addSubject = () => setSubjects((prev) => [...prev, ""]);
  const removeSubject = (i: number) =>
    setSubjects((prev) => (prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)));

  return (
    <form ref={formRef} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Nombre</span>
        <input name="name" required defaultValue={initial?.name ?? ""} placeholder="Profe Seba" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Título</span>
        <input name="title" defaultValue={initial?.title ?? ""} placeholder="Ingeniero Químico · Matemática" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Modalidad</span>
        <select name="modality" defaultValue={initial?.modality ?? "ambas"} className={field}>
          <option value="ambas">Presencial y virtual</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">
          WhatsApp <span className="text-ink-mute">(mensaje directo)</span>
        </span>
        <input name="whatsapp" defaultValue={initial?.whatsapp ?? ""} placeholder="+54 9 299 ..." className={field} />
      </label>

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
