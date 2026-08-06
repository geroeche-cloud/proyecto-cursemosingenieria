import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

type Row = { university_id: string; clicks: number | null; label: string; tipo: string };

export default async function AdminResumenPage() {
  const supabase = await createClient();

  const [uniRes, ambRes, newsRes, oppRes, profRes, driveRes] = await Promise.all([
    supabase.from("universities").select("id, name, short_name, status"),
    supabase.from("profiles").select("id, status").eq("role", "ambassador"),
    supabase.from("news").select("id, title, university_id, status, clicks"),
    supabase.from("opportunities").select("id, title, university_id, status, clicks"),
    supabase.from("professors").select("id, name, university_id, status, clicks"),
    supabase.from("drives").select("id, owner, university_id, status, clicks"),
  ]);

  logIfError("admin resumen universities", uniRes.error);
  logIfError("admin resumen profiles", ambRes.error);
  logIfError("admin resumen news", newsRes.error);
  logIfError("admin resumen opportunities", oppRes.error);
  logIfError("admin resumen professors", profRes.error);
  logIfError("admin resumen drives", driveRes.error);

  const unis = (uniRes.data ?? []) as { id: string; name: string; short_name: string | null; status: string }[];
  const ambs = (ambRes.data ?? []) as { id: string; status: string }[];
  const uniName = new Map(unis.map((u) => [u.id, u.short_name || u.name]));

  const pub = <T extends { status: string }>(rows: T[] | null) =>
    (rows ?? []).filter((r) => r.status === "published");

  const news = pub(newsRes.data as { status: string; university_id: string; clicks: number | null; title: string; id: string }[] | null);
  const opps = pub(oppRes.data as { status: string; university_id: string; clicks: number | null; title: string; id: string }[] | null);
  const profs = pub(profRes.data as { status: string; university_id: string; clicks: number | null; name: string; id: string }[] | null);
  const drives = pub(driveRes.data as { status: string; university_id: string; clicks: number | null; owner: string; id: string }[] | null);

  const todo: Row[] = [
    ...news.map((r) => ({ university_id: r.university_id, clicks: r.clicks, label: r.title, tipo: "Noticia" })),
    ...opps.map((r) => ({ university_id: r.university_id, clicks: r.clicks, label: r.title, tipo: "Oportunidad" })),
    ...profs.map((r) => ({ university_id: r.university_id, clicks: r.clicks, label: r.name, tipo: "Profesor" })),
    ...drives.map((r) => ({ university_id: r.university_id, clicks: r.clicks, label: `Drive de ${r.owner}`, tipo: "Drive" })),
  ];

  const totalPublicado = todo.length;
  const totalClics = todo.reduce((n, r) => n + (r.clicks ?? 0), 0);
  const activas = unis.filter((u) => u.status === "active").length;
  const embActivos = ambs.filter((a) => a.status === "active").length;
  const suspendidos = ambs.length - embActivos;

  const ranking = todo
    .filter((r) => (r.clicks ?? 0) > 0)
    .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0))
    .slice(0, 8);

  // Actividad por universidad: cuánto publicó y cuántos clics acumula.
  const porUni = unis
    .map((u) => {
      const items = todo.filter((r) => r.university_id === u.id);
      return {
        id: u.id,
        nombre: u.short_name || u.name,
        publicaciones: items.length,
        clics: items.reduce((n, r) => n + (r.clicks ?? 0), 0),
        activa: u.status === "active",
      };
    })
    .sort((a, b) => b.clics - a.clics || b.publicaciones - a.publicaciones);

  const stats = [
    { label: "Universidades activas", value: activas, sub: `${unis.length} en total` },
    { label: "Embajadores activos", value: embActivos, sub: `${suspendidos} suspendido${suspendidos === 1 ? "" : "s"}` },
    { label: "Publicaciones en vivo", value: totalPublicado, sub: "en todo el país" },
    { label: "Clics acumulados", value: totalClics, sub: "sobre el contenido publicado" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-hair-strong p-5" style={{ background: CARD }}>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-mute">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Lo más visto en todo el país */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="metal-tick" />
          <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
            Lo más visto del país
          </h2>
        </div>

        {ranking.length === 0 ? (
          <p className="text-sm text-ink-mute">
            Todavía no hay clics registrados. Cuando la gente empiece a usar el contenido,
            acá vas a ver qué funciona en cada universidad.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-hair">
            <ul className="divide-y divide-hair">
              {ranking.map((r, i) => (
                <li
                  key={`${r.tipo}-${i}`}
                  className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-xs text-ink-mute">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-ink break-anywhere">{r.label}</p>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-mute">
                        {r.tipo} · {uniName.get(r.university_id) ?? "—"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 self-start rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-xs text-blue-300 sm:self-auto">
                    {r.clicks} clic{r.clicks === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Actividad por universidad */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="metal-tick" />
          <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
            Actividad por universidad
          </h2>
        </div>

        {porUni.length === 0 ? (
          <p className="text-sm text-ink-mute">
            Todavía no hay universidades.{" "}
            <Link href="/admin/universidades" className="text-blue-300 hover:text-blue-200">
              Crear la primera
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {porUni.map((u) => (
              <div key={u.id} className="rounded-2xl border border-hair-strong p-5" style={{ background: CARD }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-lg font-semibold text-ink break-anywhere">{u.nombre}</p>
                  {!u.activa && (
                    <span className="shrink-0 rounded-full border border-hair px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-ink-mute">
                      Inactiva
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div>
                    <p className="font-display text-2xl font-bold text-ink">{u.publicaciones}</p>
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute">
                      publicaciones
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-blue-300">{u.clics}</p>
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute">
                      clics
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
