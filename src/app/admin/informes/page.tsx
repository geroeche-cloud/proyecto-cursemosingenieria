import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";
import { getReportStats, getReportByUniversity } from "@/lib/informes";
import {
  StatCard,
  BarrasSemanales,
  RedesDesglose,
  crecimientoTexto,
  fmtNum,
} from "@/components/informes/ReportBits";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

export default async function AdminInformesPage() {
  const supabase = await createClient();

  const [{ stats, listo }, porUni, uniRes, ambRes] = await Promise.all([
    getReportStats(null),
    getReportByUniversity(),
    supabase.from("universities").select("id, name, short_name, status").is("deleted_at", null),
    supabase
      .from("profiles")
      .select("id, status")
      .eq("role", "ambassador")
      .is("deleted_at", null),
  ]);
  logIfError("admin informes universities", uniRes.error);

  const unis = (uniRes.data ?? []) as {
    id: string;
    name: string;
    short_name: string | null;
    status: string;
  }[];
  const uniName = new Map(unis.map((u) => [u.id, u.short_name || u.name]));
  const activas = unis.filter((u) => u.status === "active").length;
  const embActivos = ((ambRes.data ?? []) as { status: string }[]).filter(
    (a) => a.status === "active",
  ).length;

  const ranking = porUni
    .filter((r) => uniName.has(r.university_id))
    .map((r) => ({ ...r, nombre: uniName.get(r.university_id) ?? "—" }))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-10">
      <section
        className="flex flex-col gap-4 rounded-3xl border border-hair-strong p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        style={{ background: CARD }}
      >
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-blue-300">
            Informe ejecutivo
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            El peso de Cursemos Ingeniería
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {crecimientoTexto(stats.mes_actual, stats.mes_anterior)}
          </p>
        </div>
        <a
          href="/admin/informes/pdf"
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

      {/* Los números que se dicen en una reunión */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estudiantes que usan la plataforma" value={stats.estudiantes} sub="personas distintas" accent />
        <StatCard label="Interacciones totales" value={stats.interacciones} sub="clics sobre contenido real" />
        <StatCard label="Clics a oportunidades" value={stats.oportunidades} sub="becas y convocatorias" />
        <StatCard label="Mensajes a profesores" value={stats.mensajes_profes} sub={`${fmtNum(stats.estudiantes_profes)} estudiantes`} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Universidades activas" value={activas} />
        <StatCard label="Embajadores activos" value={embActivos} />
        <StatCard label="Visitas a campus" value={stats.visitas} />
        <StatCard label="Recursos abiertos" value={stats.recursos} sub="drives de estudio" />
        <StatCard label="Clics a redes" value={stats.redes} sub="Instagram, LinkedIn…" />
      </section>

      {/* Actividad semanal */}
      <section className="rounded-2xl border border-hair-strong p-5 sm:p-6" style={{ background: CARD }}>
        <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
          Actividad nacional · últimas 8 semanas
        </p>
        <BarrasSemanales semanas={stats.semanas} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ranking de universidades */}
        <section className="rounded-2xl border border-hair-strong p-5 sm:p-6" style={{ background: CARD }}>
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
            Universidades con más actividad
          </p>
          {ranking.length === 0 ? (
            <p className="text-sm text-ink-mute">Todavía no hay actividad registrada.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {ranking.map((r, i) => (
                <li key={r.university_id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-xs text-ink-mute">{i + 1}</span>
                    <p className="truncate text-sm text-ink">{r.nombre}</p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-ink-soft">
                    {fmtNum(r.estudiantes)} est. · {fmtNum(r.interacciones)} inter.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Redes */}
        <section className="rounded-2xl border border-hair-strong p-5 sm:p-6" style={{ background: CARD }}>
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
            Tráfico a redes
          </p>
          <RedesDesglose porRed={stats.por_red} />
        </section>
      </div>

      <p className="text-xs leading-relaxed text-ink-faint">
        Metodología: cada interacción se cuenta una sola vez por estudiante y por día
        (sistema anti-duplicados en la base de datos). Los datos se generan automáticamente
        desde la actividad real de la plataforma.
      </p>
    </div>
  );
}
