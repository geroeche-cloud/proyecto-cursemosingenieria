"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createNews, updateNews, type ActionState } from "./actions";

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const initialState: ActionState = { ok: false };

export type NoticiaInitial = {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export function NoticiaForm({ initial }: { initial?: NoticiaInitial }) {
  const isEdit = !!initial;
  const router = useRouter();
  const [state, action, pending] = useActionState(isEdit ? updateNews : createNews, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    if (isEdit) router.push("/panel/noticias");
    else formRef.current?.reset();
  }, [state, isEdit, router]);

  return (
    <form ref={formRef} action={action} className="mt-4 flex flex-col gap-3">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Título</span>
        <input name="title" required defaultValue={initial?.title ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Resumen</span>
        <input name="summary" defaultValue={initial?.summary ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-ink-soft">Contenido</span>
        <textarea name="body" rows={4} defaultValue={initial?.body ?? ""} className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>
      {!isEdit && (
        <p className="text-[0.68rem] text-ink-mute">
          Si dejás las fechas vacías, se publica ya y no caduca. Podés cargarla antes
          con fecha futura y se activa sola ese día.
        </p>
      )}
      <div className="flex flex-col gap-2">
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
