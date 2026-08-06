import { createClient } from "@/lib/supabase/server";
import { setNewsStatus, deleteNews } from "./actions";
import { NoticiaForm } from "./NoticiaForm";
import { scheduleState, type ScheduleTone } from "@/lib/schedule";

type News = {
  id: string;
  title: string;
  summary: string | null;
  status: "draft" | "published" | "archived";
  starts_at: string | null;
  ends_at: string | null;
};

const TONE: Record<ScheduleTone, string> = {
  emerald:
    "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-emerald-300",
  amber:
    "rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-amber-300",
  red: "rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-red-300",
  muted:
    "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-mute",
};

export default async function NoticiasPanelPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("news")
    .select("id, title, summary, status, starts_at, ends_at")
    .order("created_at", { ascending: false });
  const news = (data ?? []) as News[];

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold">Nueva noticia</h2>
        <NoticiaForm />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Tus noticias</h2>
        <div className="mt-4 flex flex-col gap-3">
          {news.length === 0 ? (
            <p className="text-sm text-ink-mute">Todavía no cargaste noticias.</p>
          ) : (
            news.map((n) => {
              const sched = scheduleState(n.status, n.starts_at, n.ends_at);
              return (
              <article key={n.id} className="rounded-2xl border border-hair bg-surface p-5">
                <span className={TONE[sched.tone]}>{sched.label}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{n.title}</h3>
                {n.summary && <p className="mt-1 text-sm text-ink-soft">{n.summary}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={`/panel/noticias/${n.id}`} className="btn btn-ghost text-xs">
                    Editar
                  </a>
                  {n.status !== "published" ? (
                    <form action={setNewsStatus}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="status" value="published" />
                      <button type="submit" className="btn btn-blue text-xs">
                        Publicar
                      </button>
                    </form>
                  ) : (
                    <form action={setNewsStatus}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="status" value="draft" />
                      <button type="submit" className="btn btn-ghost text-xs">
                        Despublicar
                      </button>
                    </form>
                  )}
                  <form action={deleteNews}>
                    <input type="hidden" name="id" value={n.id} />
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
