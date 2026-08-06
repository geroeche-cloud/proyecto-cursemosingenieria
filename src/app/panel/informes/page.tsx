import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getReportStats } from "@/lib/informes";
import {
  StatCard,
  BarrasSemanales,
  RedesDesglose,
  crecimientoTexto,
  fmtNum,
} from "@/components/informes/ReportBits";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

export default async function PanelInformesPage() {
  const user = await getSessionUser();
  if (!user?.university_id) redirect("/login");

  const supabase = await createClient();
  const [{ stats, listo }, uniRes, topRes] = await Promise.all([
    getReportStats(user.university_id),
    supabase.from("universities").select("name").eq("id", user.university_id).single(),
    Promise.all([
      supabase.from("news").select("title, clicks").eq("status", "published").is("deleted_at", null).order("clicks", { ascending: false }).limit(3),
      supabase.from("opportunities").select("title, clicks").eq("status", "published").is("deleted_at", null).order("clicks", { ascending: false }).limit(3),
      supabase.from("professors").select("name, clicks").eq("status", "published").is("deleted_at", null).order("clicks", { ascending: false }).limit(3),
      supabase.from("drives").select("owner, clicks").eq("status", "published").is("deleted_at", null).order("clicks", { ascending: false }).limit(3),
    ]),
  ]);

  const uniNombre = uniRes.data?.name ?? "tu universidad";
  const [nTop, oTop, pTop, dTop] = topRes;
  const top = [
    ...((nTop.data ?? []) as { title: string; clicks: number | null }[]).map((r) => ({ label: r.title, tipo: "Noticia", n: r.clicks ?? 0 })),
    ...((oTop.data ?? []) as { title: string; clicks: number | null }[]).map((r) => ({ label: r.title, tipo: "Oportunidad", n: r.clicks ?? 0 })),
    ...((pTop.data ?? []) as { name: string; clicks: number | null }[]).map((r) => ({ label: r.name, tipo: "Profesor", n: r.clicks ?? 0 })),
    ...((dTop.data ?? []) as { owner: string; clicks: number | null }[]).map((r) => ({ label: `Drive de ${r.owner}`, tipo: "Drive", n: r.clicks ?? 0 })),
  ]
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-10">
      <section
        className="flex flex-col gap-4 rounded-3xl border border-hair-strong p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        style={{ background: CARD }}
      >
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-blue-300">
            Informe de impacto
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Cursemos Ingeniería en tu universidad
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{crecimientoTexto(stats.mes_actual, stats.mes_anterior)}</p>
        </div>
        <a
          href="/panel/informes/pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-blue shrink-0 self-start text-sm sm:self-auto"
        >
          Descargar PDF ↗
        </a>
      </section>

      {!listo && (
        <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
          Los informes se activan al correr la migración 0010 en Supabase. Hasta entonces,
          los números se muestran en cero.
        </p>
      )}

      {/* Métricas principales */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estudiantes alcanzados" value={stats.estudiantes} sub="personas distintas" accent />
        <StatCard label="Visitas al campus" value={stats.visitas} />
        <StatCard label="Interacciones" value={stats.interacciones} sub="clics sobre contenido" />
        <StatCard label="Clics a oportunidades" value={stats.oportunidades} sub="convocatorias y becas" />
      </section>

      {/* Impacto concreto */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mensajes a profesores" value={stats.mensajes_profes} sub={`${fmtNum(stats.estudiantes_profes)} estudiante${stats.estudiantes_profes === 1 ? "" : "s"}`} />
        <StatCard label="Recursos abiertos" value={stats.recursos} sub="drives de estudio" />
        <StatCard label="Lecturas de noticias" value={stats.noticias} />
        <StatCard label="Clics a redes" value={stats.redes} sub="Instagram, LinkedIn…" />
      </section>

      {/* Actividad semanal */}
      <section className="rounded-2xl border border-hair-strong p-5 sm:p-6" style={{ background: CARD }}>
        <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
          Últimas 8 semanas
        </p>
        <BarrasSemanales semanas={stats.semanas} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Redes */}
        <section className="rounded-2xl border border-hair-strong p-5 sm:p-6" style={{ background: CARD }}>
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
            Tráfico a redes
          </p>
          <RedesDesglose porRed={stats.por_red} />
        </section>

        {/* Top publicaciones */}
        <section className="rounded-2xl border border-hair-strong p-5 sm:p-6" style={{ background: CARD }}>
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
            Publicaciones con más impacto
          </p>
          {top.length === 0 ? (
            <p className="text-sm text-ink-mute">Todavía no hay clics sobre tus publicaciones.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {top.map((t, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{t.label}</p>
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute">{t.tipo}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 font-mono text-xs text-blue-300">
                    {fmtNum(t.n)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-xs leading-relaxed text-ink-faint">
        Metodología: cada interacción se cuenta una sola vez por estudiante y por día
        (sistema anti-duplicados en la base de datos). “{uniNombre}”. Los datos se generan
        automáticamente desde la actividad real de la plataforma.
      </p>
    </div>
  );
}
