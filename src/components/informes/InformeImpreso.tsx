import type { ReactNode } from "react";
import {
  BarrasSemanales,
  RedesDesglose,
  crecimientoTexto,
  fmtNum,
  type Stats,
} from "./ReportBits";

function Metrica({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-neutral-900">{fmtNum(value)}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

/**
 * El informe en su versión imprimible (fondo blanco, A4). Es la pieza que un
 * embajador o el equipo puede presentar ante una empresa o un organismo.
 */
export function InformeImpreso({
  titulo,
  subtitulo,
  stats,
  extra,
}: {
  titulo: string;
  subtitulo: string;
  stats: Stats;
  extra?: ReactNode;
}) {
  const fecha = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="report-print mx-auto max-w-3xl bg-white px-8 py-10 text-neutral-900">
      {/* Encabezado */}
      <header className="flex items-start justify-between gap-4 border-b-2 border-neutral-900 pb-5">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-blue-700">
            Cursemos Ingeniería
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight">{titulo}</h1>
          <p className="mt-1 text-sm text-neutral-600">{subtitulo}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
            Informe de impacto
          </p>
          <p className="mt-0.5 text-sm font-medium">{fecha}</p>
        </div>
      </header>

      {/* Resumen en una línea */}
      <p className="mt-5 text-sm font-medium text-neutral-800">
        {crecimientoTexto(stats.mes_actual, stats.mes_anterior)}.
      </p>

      {/* Métricas principales */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica label="Estudiantes alcanzados" value={stats.estudiantes} sub="personas distintas" />
        <Metrica label="Visitas" value={stats.visitas} />
        <Metrica label="Interacciones" value={stats.interacciones} />
        <Metrica label="Clics a oportunidades" value={stats.oportunidades} />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica
          label="Mensajes a profesores"
          value={stats.mensajes_profes}
          sub={`${fmtNum(stats.estudiantes_profes)} estudiantes`}
        />
        <Metrica label="Recursos abiertos" value={stats.recursos} />
        <Metrica label="Lecturas de noticias" value={stats.noticias} />
        <Metrica label="Clics a redes" value={stats.redes} />
      </section>

      {/* Gráficos */}
      <section className="mt-7">
        <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
          Actividad de las últimas 8 semanas
        </p>
        <BarrasSemanales semanas={stats.semanas} print />
      </section>

      <section className="mt-7">
        <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
          Tráfico enviado a redes
        </p>
        <RedesDesglose porRed={stats.por_red} print />
      </section>

      {extra}

      {/* Pie con metodología: la credibilidad del informe */}
      <footer className="mt-8 border-t border-neutral-200 pt-4">
        <p className="text-[0.7rem] leading-relaxed text-neutral-500">
          Metodología: los datos se generan automáticamente desde la actividad real de la
          plataforma. Cada interacción se cuenta una sola vez por estudiante y por día
          mediante un sistema anti-duplicados en la base de datos. “Estudiantes alcanzados”
          corresponde a personas distintas (dispositivos únicos anónimos).
        </p>
        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-neutral-400">
          cursemosingenieria — plataforma nacional de ingeniería
        </p>
      </footer>
    </div>
  );
}
