import { createClient } from "@/lib/supabase/server";
import { OpportunityForm } from "./OpportunityForm";
import { setOpportunityStatus, deleteOpportunity } from "./actions";
import { scheduleState, type ScheduleTone } from "@/lib/schedule";

type Opportunity = {
  id: string;
  kind: string;
  title: string;
  org: string | null;
  deadline: string | null;
  requirements: string[] | null;
  status: "draft" | "published" | "archived";
  starts_at: string | null;
  ends_at: string | null;
};

const KIND_LABEL: Record<string, string> = {
  beca: "Beca",
  pasantia: "Pasantía",
  programa: "Programa",
  evento: "Evento",
  competencia: "Competencia",
  noticia: "Noticia",
};

const TONE: Record<ScheduleTone, string> = {
  emerald:
    "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300",
  amber:
    "rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-amber-300",
  red: "rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-red-300",
  muted:
    "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute",
};

export default async function OportunidadesPanelPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("opportunities")
    .select("id, kind, title, org, deadline, requirements, status, starts_at, ends_at")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Opportunity[];

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold">Nueva oportunidad</h2>
        <OpportunityForm />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Tus oportunidades</h2>
        <div className="mt-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-ink-mute">Todavía no cargaste oportunidades.</p>
          ) : (
            items.map((o) => {
              const sched = scheduleState(o.status, o.starts_at, o.ends_at);
              return (
              <article key={o.id} className="rounded-2xl border border-hair bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-blue-300">
                    {KIND_LABEL[o.kind] ?? o.kind}
                  </span>
                  <span className={TONE[sched.tone]}>{sched.label}</span>
                  {o.deadline && (
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-mute">
                      {o.deadline}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{o.title}</h3>
                {o.org && <p className="text-sm text-ti-500">{o.org}</p>}
                {o.requirements && o.requirements.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm text-ink-soft">
                    {o.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={`/panel/oportunidades/${o.id}`} className="btn btn-ghost text-xs">
                    Editar
                  </a>
                  {o.status !== "published" ? (
                    <form action={setOpportunityStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value="published" />
                      <button type="submit" className="btn btn-blue text-xs">
                        Publicar
                      </button>
                    </form>
                  ) : (
                    <form action={setOpportunityStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value="draft" />
                      <button type="submit" className="btn btn-ghost text-xs">
                        Despublicar
                      </button>
                    </form>
                  )}
                  <form action={deleteOpportunity}>
                    <input type="hidden" name="id" value={o.id} />
                    <button type="submit" className="btn btn-ghost text-xs text-red-300">
                      Borrar
                    </button>
                  </form>
                </div>
              </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
