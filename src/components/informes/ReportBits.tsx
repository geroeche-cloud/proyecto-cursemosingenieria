/**
 * Piezas visuales de los informes de impacto. Sin librerías de gráficos:
 * tarjetas y barras hechas con divs — livianas, imprimibles y sin JS extra.
 */

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

const nf = new Intl.NumberFormat("es-AR");
export const fmtNum = (n: number | null | undefined) => nf.format(n ?? 0);

export type Semana = { semana: string; visitas: number; interacciones: number };

export type Stats = {
  visitas: number;
  estudiantes: number;
  interacciones: number;
  noticias: number;
  oportunidades: number;
  mensajes_profes: number;
  estudiantes_profes: number;
  recursos: number;
  redes: number;
  mes_actual: number;
  mes_anterior: number;
  por_red: Record<string, number>;
  semanas: Semana[];
};

export const STATS_VACIAS: Stats = {
  visitas: 0, estudiantes: 0, interacciones: 0, noticias: 0, oportunidades: 0,
  mensajes_profes: 0, estudiantes_profes: 0, recursos: 0, redes: 0,
  mes_actual: 0, mes_anterior: 0, por_red: {}, semanas: [],
};

/** Métrica principal: número grande, lectura en un segundo. */
export function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border border-hair-strong p-5"
      style={{ background: CARD }}
    >
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-mute">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold sm:text-4xl ${accent ? "text-blue-300" : "text-ink"}`}>
        {fmtNum(value)}
      </p>
      {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

/** Texto de crecimiento mensual en lenguaje humano. */
export function crecimientoTexto(actual: number, anterior: number): string {
  if (anterior > 0) {
    const pct = Math.round(((actual - anterior) / anterior) * 100);
    if (pct > 0) return `+${pct}% de interacciones vs. el mes pasado`;
    if (pct < 0) return `${pct}% de interacciones vs. el mes pasado`;
    return "Mismo nivel de interacciones que el mes pasado";
  }
  if (actual > 0) return "Primer mes con actividad registrada";
  return "Sin actividad registrada todavía";
}

/** Gráfico de barras semanal (visitas + interacciones), puro CSS. */
export function BarrasSemanales({ semanas, print = false }: { semanas: Semana[]; print?: boolean }) {
  if (semanas.length === 0) {
    return (
      <p className={`text-sm ${print ? "text-neutral-500" : "text-ink-mute"}`}>
        Todavía no hay actividad suficiente para el gráfico semanal.
      </p>
    );
  }
  const max = Math.max(...semanas.map((s) => Math.max(s.visitas, s.interacciones)), 1);
  const labelCls = print ? "text-neutral-500" : "text-ink-mute";

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: "9rem" }}>
        {semanas.map((s) => (
          <div key={s.semana} className="flex h-full flex-1 flex-col justify-end gap-1">
            <div className="flex h-full items-end justify-center gap-1">
              <div
                title={`${fmtNum(s.visitas)} visitas`}
                className="w-full max-w-[14px] rounded-t"
                style={{
                  height: `${Math.max((s.visitas / max) * 100, s.visitas > 0 ? 4 : 0)}%`,
                  background: "linear-gradient(180deg, #9cb6ff, #3b6bff)",
                }}
              />
              <div
                title={`${fmtNum(s.interacciones)} interacciones`}
                className="w-full max-w-[14px] rounded-t"
                style={{
                  height: `${Math.max((s.interacciones / max) * 100, s.interacciones > 0 ? 4 : 0)}%`,
                  background: print ? "#94a3b8" : "rgba(216,234,255,0.45)",
                }}
              />
            </div>
            <p className={`text-center font-mono text-[0.55rem] ${labelCls}`}>
              {s.semana.slice(8, 10)}/{s.semana.slice(5, 7)}
            </p>
          </div>
        ))}
      </div>
      <div className={`mt-3 flex items-center gap-4 font-mono text-[0.6rem] uppercase tracking-[0.12em] ${labelCls}`}>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: "#3b6bff" }} />
          Visitas
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: print ? "#94a3b8" : "rgba(216,234,255,0.45)" }}
          />
          Interacciones
        </span>
      </div>
    </div>
  );
}

const RED_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  mail: "Mail",
};

/** Desglose de clics a redes, como barras horizontales. */
export function RedesDesglose({ porRed, print = false }: { porRed: Record<string, number>; print?: boolean }) {
  const entradas = Object.entries(porRed).sort((a, b) => b[1] - a[1]);
  if (entradas.length === 0) {
    return (
      <p className={`text-sm ${print ? "text-neutral-500" : "text-ink-mute"}`}>
        Todavía no hay clics registrados hacia redes.
      </p>
    );
  }
  const max = Math.max(...entradas.map(([, n]) => n), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {entradas.map(([red, n]) => (
        <div key={red} className="flex items-center gap-3">
          <span
            className={`w-20 shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.1em] ${
              print ? "text-neutral-600" : "text-ink-soft"
            }`}
          >
            {RED_LABEL[red] ?? red}
          </span>
          <div className={`h-3 flex-1 overflow-hidden rounded-full ${print ? "bg-neutral-200" : "bg-white/5"}`}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((n / max) * 100, 3)}%`,
                background: "linear-gradient(90deg, #6e93ff, #1e42b0)",
              }}
            />
          </div>
          <span className={`w-12 shrink-0 text-right font-mono text-xs ${print ? "text-neutral-800" : "text-ink"}`}>
            {fmtNum(n)}
          </span>
        </div>
      ))}
    </div>
  );
}
