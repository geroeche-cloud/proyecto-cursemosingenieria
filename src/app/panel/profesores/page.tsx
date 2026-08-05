import { createClient } from "@/lib/supabase/server";
import { ProfessorForm } from "./ProfessorForm";
import { setProfessorStatus, deleteProfessor } from "./actions";

type Professor = {
  id: string;
  name: string;
  title: string | null;
  modality: "presencial" | "virtual" | "ambas";
  subjects: string[] | null;
  whatsapp: string | null;
  status: "draft" | "published" | "archived";
};

const MODALITY_LABEL: Record<Professor["modality"], string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  ambas: "Presencial y virtual",
};

export default async function ProfesoresPanelPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("professors")
    .select("id, name, title, modality, subjects, whatsapp, status")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Professor[];

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold">Nuevo profesor</h2>
        <ProfessorForm />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Tus profesores</h2>
        <div className="mt-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-ink-mute">Todavía no cargaste profesores.</p>
          ) : (
            items.map((p) => (
              <article key={p.id} className="rounded-2xl border border-hair bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-blue-300">
                    {MODALITY_LABEL[p.modality]}
                  </span>
                  <span
                    className={
                      p.status === "published"
                        ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300"
                        : "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute"
                    }
                  >
                    {p.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{p.name}</h3>
                {p.title && <p className="text-sm text-ti-500">{p.title}</p>}
                {p.subjects && p.subjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.subjects.map((s, i) => (
                      <span key={i} className="rounded-full border border-hair px-2.5 py-0.5 text-xs text-ink-soft">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {p.whatsapp && <p className="mt-2 font-mono text-xs text-ink-mute">WhatsApp: {p.whatsapp}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {p.status !== "published" ? (
                    <form action={setProfessorStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="published" />
                      <button type="submit" className="btn btn-blue text-xs">
                        Publicar
                      </button>
                    </form>
                  ) : (
                    <form action={setProfessorStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="draft" />
                      <button type="submit" className="btn btn-ghost text-xs">
                        Despublicar
                      </button>
                    </form>
                  )}
                  <form action={deleteProfessor}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn-ghost text-xs text-red-300">
                      Borrar
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
