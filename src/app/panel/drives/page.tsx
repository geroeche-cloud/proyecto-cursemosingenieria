import { createClient } from "@/lib/supabase/server";
import { DriveForm } from "./DriveForm";
import { setDriveStatus, deleteDrive } from "./actions";

type Drive = {
  id: string;
  owner: string;
  career: string | null;
  href: string | null;
  status: "draft" | "published" | "archived";
  clicks: number;
};

export default async function DrivesPanelPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("drives")
    .select("id, owner, career, href, status, clicks")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Drive[];

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold">Nuevo drive</h2>
        <DriveForm />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Tus drives</h2>
        <div className="mt-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-ink-mute">Todavía no cargaste drives.</p>
          ) : (
            items.map((d) => (
              <article key={d.id} className="rounded-2xl border border-hair bg-surface p-5">
                <span
                  className={
                    d.status === "published"
                      ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300"
                      : "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute"
                  }
                >
                  {d.status === "published" ? "Publicado" : "Borrador"}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">Drive de {d.owner}</h3>
                {d.career && (
                  <p className="font-mono text-xs uppercase tracking-[0.1em] text-ti-500">{d.career}</p>
                )}
                {d.href && (
                  <a
                    href={d.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block break-all font-mono text-xs text-blue-300 hover:text-blue-200"
                  >
                    {d.href}
                  </a>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={`/panel/drives/${d.id}`} className="btn btn-ghost text-xs">
                    Editar
                  </a>
                  <span className="order-last ml-auto font-mono text-xs text-ink-mute">
                    {d.clicks} clic{d.clicks === 1 ? "" : "s"}
                  </span>
                  {d.status !== "published" ? (
                    <form action={setDriveStatus}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="published" />
                      <button type="submit" className="btn btn-blue text-xs">
                        Publicar
                      </button>
                    </form>
                  ) : (
                    <form action={setDriveStatus}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="draft" />
                      <button type="submit" className="btn btn-ghost text-xs">
                        Despublicar
                      </button>
                    </form>
                  )}
                  <form action={deleteDrive}>
                    <input type="hidden" name="id" value={d.id} />
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
