import Link from "next/link";
import { getAdminResumen } from "@/lib/resumenes";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

export default async function AdminResumenPage() {
  // Todo el resumen del país lo calcula la base (migración 0013). Antes esta
  // pantalla se traía TODAS las filas de los cuatro módulos de TODAS las
  // universidades para contarlas y ordenarlas acá.
  const r = await getAdminResumen();

  const ranking = r.ranking;
  const porUni = r.por_universidad;
  const suspendidos = r.embajadores_suspendidos;

  const stats = [
    { label: "Universidades activas", value: r.universidades_activas, sub: `${r.universidades_total} en total` },
    { label: "Embajadores activos", value: r.embajadores_activos, sub: `${suspendidos} suspendido${suspendidos === 1 ? "" : "s"}` },
    { label: "Publicaciones en vivo", value: r.publicaciones, sub: "en todo el país" },
    { label: "Clics acumulados", value: r.clics, sub: "sobre el contenido publicado" },
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
                        {r.tipo} · {r.universidad ?? "—"}
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
