/**
 * Vigencia por fechas para publicaciones (noticias y oportunidades).
 * Una publicación "published" solo se ve en público cuando HOY está dentro de
 * su ventana [starts_at, ends_at]. Las fechas son opcionales:
 *   · sin starts_at  → activa desde siempre
 *   · sin ends_at    → no caduca
 * No hace falta cron: la visibilidad y el estado se calculan por fecha.
 */

/**
 * Zona horaria del proyecto.
 *
 * TODO lo que se muestre con fecha u hora tiene que usarla, sin excepción.
 *
 * El motivo no es preferencia: el código corre en los servidores de Vercel, que
 * están en UTC. Un `toLocaleDateString("es-AR")` sin zona NO usa la hora de
 * Argentina — usa la del servidor, y solo cambia el idioma. Son tres horas de
 * diferencia.
 *
 * En un informe eso se ve como una hora equivocada. En una fecha es peor y más
 * difícil de notar: todo lo que pase entre las 21:00 y la medianoche se muestra
 * con la fecha del DÍA SIGUIENTE. Una noticia publicada un martes a las 22 hs
 * aparece fechada el miércoles.
 */
export const ZONA = "America/Argentina/Buenos_Aires";

/** Fecha de hoy (YYYY-MM-DD) en horario de Argentina. */
export function todayAR(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA });
}

/** Fecha larga en hora argentina. Ej: "8 de agosto de 2026". */
export function fechaLarga(d?: string | number | Date | null): string {
  const f = d ? new Date(d) : new Date();
  if (Number.isNaN(f.getTime())) return "";
  return f.toLocaleDateString("es-AR", {
    timeZone: ZONA,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Fecha corta en hora argentina. Ej: "08 ago 2026". */
export function fechaCorta(d?: string | number | Date | null): string {
  const f = d ? new Date(d) : new Date();
  if (Number.isNaN(f.getTime())) return "";
  return f.toLocaleDateString("es-AR", {
    timeZone: ZONA,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Hora en horario argentino, en formato de 24 horas. Ej: "22:30".
 *
 * `hour12: false` es a propósito: sin eso, el formato "es-AR" devolvía
 * "10:30 p. m.", que nadie escribe así acá. Acá se dice 22:30.
 */
export function hora(d?: string | number | Date | null): string {
  const f = d ? new Date(d) : new Date();
  if (Number.isNaN(f.getTime())) return "";
  return f.toLocaleTimeString("es-AR", {
    timeZone: ZONA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
