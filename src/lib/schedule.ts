/**
 * Vigencia por fechas para publicaciones (noticias y oportunidades).
 * Una publicación "published" solo se ve en público cuando HOY está dentro de
 * su ventana [starts_at, ends_at]. Las fechas son opcionales:
 *   · sin starts_at  → activa desde siempre
 *   · sin ends_at    → no caduca
 * No hace falta cron: la visibilidad y el estado se calculan por fecha.
 */

/** Fecha de hoy (YYYY-MM-DD) en horario de Argentina. */
export function todayAR(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/** YYYY-MM-DD → DD/MM/YYYY. */
export function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-");
  return day && m && y ? `${day}/${m}/${y}` : d;
}

/** ¿Está activa hoy? (comparación lexicográfica de fechas ISO). */
export function isActiveNow(
  starts_at: string | null,
  ends_at: string | null,
  today: string = todayAR(),
): boolean {
  if (starts_at && starts_at.slice(0, 10) > today) return false;
  if (ends_at && ends_at.slice(0, 10) < today) return false;
  return true;
}

export type ScheduleTone = "muted" | "amber" | "red" | "emerald";

/** Estado que ve el embajador en el panel. */
export function scheduleState(
  status: string,
  starts_at: string | null,
  ends_at: string | null,
  today: string = todayAR(),
): { label: string; tone: ScheduleTone } {
  if (status !== "published") return { label: "Borrador", tone: "muted" };
  if (starts_at && starts_at.slice(0, 10) > today)
    return { label: `Programada · desde ${fmtDate(starts_at)}`, tone: "amber" };
  if (ends_at && ends_at.slice(0, 10) < today)
    return { label: `Caducó el ${fmtDate(ends_at)}`, tone: "red" };
  return { label: "En vivo", tone: "emerald" };
}
