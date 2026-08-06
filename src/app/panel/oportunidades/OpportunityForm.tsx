"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createOpportunity, updateOpportunity, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initialState: ActionState = { ok: false };

export type OpportunityInitial = {
  id: string;
  kind: string;
  title: string;
  org: string | null;
  description: string | null;
  deadline: string | null;
  href: string | null;
  requirements: string[] | null;
  starts_at: string | null;
  ends_at: string | null;
};

export function OpportunityForm({ initial }: { initial?: OpportunityInitial }) {
  const isEdit = !!initial;
  const router = useRouter();
  const [state, action, pending] = useActionState(
    isEdit ? updateOpportunity : createOpportunity,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    if (isEdit) router.push("/panel/oportunidades");
    else formRef.current?.reset();
  }, [state, isEdit, router]);

  return (
    <form ref={formRef} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Tipo</span>
        <select name="kind" defaultValue={initial?.kind ?? "beca"} className={field}>
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
        <input name="org" defaultValue={initial?.org ?? ""} placeholder="Fundación Roberto Rocca" className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">Título</span>
        <input name="title" required defaultValue={initial?.title ?? ""} placeholder="Beca Roberto Rocca" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Fecha límite</span>
        <input name="deadline" defaultValue={initial?.deadline ?? ""} placeholder="Inscripción hasta el 30/09" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Link de postulación</span>
        <input name="href" type="url" defaultValue={initial?.href ?? ""} placeholder="https://…" className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">Descripción</span>
        <textarea name="description" rows={2} defaultValue={initial?.description ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-ink-soft">
          Requisitos excluyentes <span className="text-ink-mute">(uno por línea)</span>
        </span>
        <textarea
          name="requirements"
          rows={3}
          defaultValue={(initial?.requirements ?? []).join("\n")}
          placeholder={"Estudiante regular de ingeniería\nPromedio académico destacado"}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">
          Activar desde <span className="text-ink-mute">(opcional)</span>
        </span>
        <input type="date" name="starts_at" defaultValue={initial?.starts_at ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">
          Caduca el <span className="text-ink-mute">(opcional)</span>
        </span>
        <input type="date" name="ends_at" defaultValue={initial?.ends_at ?? ""} className={field} />
      </label>
      {!isEdit && (
        <p className="text-[0.68rem] text-ink-mute sm:col-span-2">
          Vacías = se publica ya y no caduca. Con fecha futura, se activa sola ese día;
          al caducar deja de verse y en el panel figura como caducada.
        </p>
      )}
      <div className="flex flex-col gap-2 sm:col-span-2">
        <div className="flex flex-wrap gap-2">
          {isEdit ? (
            <button type="submit" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          ) : (
            <>
              <button type="submit" name="intent" value="publish" disabled={pending} className="btn btn-blue text-sm disabled:opacity-60">
                {pending ? "Guardando…" : "Crear y publicar"}
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
