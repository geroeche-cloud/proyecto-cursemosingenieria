import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createNews, setNewsStatus, deleteNews } from "./actions";

type News = {
  id: string;
  title: string;
  summary: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
};

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

const STATUS_LABEL: Record<News["status"], string> = {
  draft: "Borrador",
  published: "Publicada",
  archived: "Archivada",
};

export default async function PanelPage() {
  const user = await getSessionUser();
  const supabase = await createClient();

  const { data: uni } = await supabase
    .from("universities")
    .select("name, short_name")
    .eq("id", user!.university_id!)
    .single();

  // RLS devuelve SOLO las noticias de la universidad del embajador.
  const { data: newsData } = await supabase
    .from("news")
    .select("id, title, summary, status, published_at, created_at")
    .order("created_at", { ascending: false });
  const news = (newsData ?? []) as News[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
            Panel del embajador
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            {uni?.name ?? "Tu universidad"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{user?.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-ghost text-sm">
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* Crear noticia */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Nueva noticia</h2>
        <form action={createNews} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">Título</span>
            <input name="title" required className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">Resumen</span>
            <input name="summary" className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">Contenido</span>
            <textarea name="body" rows={4} className={field} />
          </label>
          <div>
            <button type="submit" className="btn btn-blue text-sm">
              Crear como borrador
            </button>
          </div>
        </form>
      </section>

      {/* Listado */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">Tus noticias</h2>
        <div className="mt-4 flex flex-col gap-3">
          {news.length === 0 ? (
            <p className="text-sm text-ink-mute">Todavía no cargaste noticias.</p>
          ) : (
            news.map((n) => (
              <article
                key={n.id}
                className="rounded-2xl border border-hair bg-surface p-5"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={
                      n.status === "published"
                        ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-emerald-300"
                        : "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-mute"
                    }
                  >
                    {STATUS_LABEL[n.status]}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{n.title}</h3>
                {n.summary && <p className="mt-1 text-sm text-ink-soft">{n.summary}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2">
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
            ))
          )}
        </div>
      </section>
    </div>
  );
}
