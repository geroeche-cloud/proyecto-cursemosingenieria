/**
 * Traductor de errores: convierte el mensaje técnico en algo accionable.
 *
 * Existe porque los errores de Postgres y Supabase llegan en inglés y hablando
 * de tablas, funciones y permisos. Un embajador que ve "Could not find the
 * function public.track_event in the schema cache" no tiene forma de saber si
 * hizo algo mal, si el sitio está roto, o si tiene que volver a intentar.
 *
 * Dos audiencias distintas, a propósito:
 * - Al embajador se le dice qué pasó y qué hacer (reintentar, o avisar).
 *   Nunca se le nombra una migración: no tiene acceso a la base ni debería.
 * - Al administrador se le agrega qué migración lo arregla, porque él sí puede
 *   resolverlo desde /admin/diagnostico.
 */

import * as Sentry from "@sentry/nextjs";

export type ErrorTraducido = {
  /** Mensaje listo para mostrar en pantalla, en castellano. */
  mensaje: string;
  /**
   * true cuando el problema es de configuración del sistema y NO de lo que
   * cargó la persona. Estos son los que conviene reportar apenas ocurren.
   */
  configuracion: boolean;
  /** Migración que lo resuelve, cuando se puede determinar. */
  migracion?: string;
};

/**
 * Qué migración crea cada pieza de la base. Cuando falta una tabla, columna o
 * función, el mensaje de Postgres la nombra, así que se puede deducir el arreglo.
 */
const ORIGEN: Array<{ patron: RegExp; migracion: string }> = [
  { patron: /display_name|ambassadors.*bucket/i, migracion: "0003_ambassador_profile_fields.sql" },
  { patron: /bio_full|instagram|tiktok|youtube|linkedin/i, migracion: "0004_ambassador_socials_bio.sql" },
  { patron: /starts_at|ends_at/i, migracion: "0006_publication_window.sql" },
  { patron: /\bclicks\b|bump_click/i, migracion: "0007_click_counter.sql" },
  { patron: /deleted_at/i, migracion: "0008_papelera.sql" },
  { patron: /click_events/i, migracion: "0009_click_events.sql" },
  { patron: /track_event|report_stats|report_by_university|\bvid\b/i, migracion: "0010_informes.sql" },
];

function migracionDe(msg: string): string | undefined {
  return ORIGEN.find((o) => o.patron.test(msg))?.migracion;
}

/**
 * @param entrada  El error de Supabase/Postgres (objeto o texto).
 * @param opciones `admin: true` agrega el nombre de la migración al mensaje.
 */
export function traducirError(
  entrada: unknown,
  opciones: { admin?: boolean } = {},
): ErrorTraducido {
  const err = entrada as { message?: string; code?: string } | undefined;
  const msg = String(err?.message ?? entrada ?? "").trim();
  const code = String(err?.code ?? "");

  const infra = (mensaje: string, migracion?: string): ErrorTraducido => ({
    mensaje:
      opciones.admin && migracion
        ? `${mensaje} Se resuelve corriendo ${migracion} — está en Diagnóstico, con el botón para copiarlo.`
        : `${mensaje}${opciones.admin ? " Revisá /admin/diagnostico." : " Avisale al administrador: no es algo que puedas resolver vos."}`,
    configuracion: true,
    migracion,
  });

  // ---- Problemas de configuración de la base ----

  // Falta una función (PostgREST no la encuentra en el esquema).
  if (code === "PGRST202" || /could not find the function/i.test(msg)) {
    return infra("Falta una función en la base de datos.", migracionDe(msg) ?? "0010_informes.sql");
  }

  // Falta una tabla.
  if (code === "42P01" || /relation .* does not exist/i.test(msg)) {
    return infra("Falta una tabla en la base de datos.", migracionDe(msg));
  }

  // Falta una columna.
  if (code === "42703" || /column .* does not exist/i.test(msg)) {
    return infra("Falta una columna en la base de datos.", migracionDe(msg));
  }

  // Ambigüedad de nombres dentro de una función (el error que ya nos pasó).
  if (code === "42702" || /is ambiguous/i.test(msg)) {
    return infra("Una función de la base tiene nombres en conflicto.", "0011_fix_ambiguedad.sql");
  }

  // Permisos: distinto de RLS, esto es un GRANT faltante.
  if (/permission denied for (function|table|schema)/i.test(msg)) {
    return infra(
      "Al servidor le falta permiso sobre una parte de la base.",
      /report_/i.test(msg) ? "0012_permisos_informes.sql" : migracionDe(msg),
    );
  }

  // ---- Problemas de sesión o permisos del usuario ----

  if (code === "42501" || /row-level security/i.test(msg)) {
    return {
      mensaje:
        "No tenés permiso para hacer eso. Si creés que sí deberías tenerlo, avisale al administrador.",
      configuracion: false,
    };
  }

  if (/jwt|refresh token|session.*expired|not authenticated/i.test(msg)) {
    return {
      mensaje: "Tu sesión venció. Volvé a ingresar y probá de nuevo.",
      configuracion: false,
    };
  }

  // ---- Problemas del contenido cargado ----

  if (code === "23505" || /duplicate key|unique constraint/i.test(msg)) {
    return {
      mensaje: "Ya existe un registro con esos datos. Cambiá el nombre o la sigla.",
      configuracion: false,
    };
  }

  if (code === "23503" || /foreign key/i.test(msg)) {
    return {
      mensaje: "Falta seleccionar algo relacionado, o lo que elegiste ya no existe.",
      configuracion: false,
    };
  }

  if (code === "22001" || /too long for type/i.test(msg)) {
    return { mensaje: "Uno de los textos es demasiado largo. Acortalo y probá de nuevo.", configuracion: false };
  }

  if (code === "23502" || /null value in column/i.test(msg)) {
    return { mensaje: "Falta completar un campo obligatorio.", configuracion: false };
  }

  // ---- Cuentas ----

  if (/already been registered|already registered/i.test(msg)) {
    return { mensaje: "Ese email ya tiene una cuenta. Usá uno distinto.", configuracion: false };
  }

  if (/password/i.test(msg) && /(least|length|weak|short|6)/i.test(msg)) {
    return { mensaje: "La contraseña es muy corta. Usá al menos 8 caracteres.", configuracion: false };
  }

  if (/invalid login credentials/i.test(msg)) {
    return { mensaje: "El email o la contraseña no coinciden.", configuracion: false };
  }

  // ---- Red ----

  if (/fetch failed|network|timeout|ETIMEDOUT|ECONNRESET/i.test(msg)) {
    return {
      mensaje: "No se pudo conectar con el servidor. Revisá tu conexión y probá de nuevo.",
      configuracion: false,
    };
  }

  // Sin coincidencia: se devuelve el original para no ocultar información útil.
  return { mensaje: msg || "Ocurrió un error inesperado. Probá de nuevo.", configuracion: false };
}

/**
 * Verifica el resultado de una escritura y LANZA si falló.
 *
 * POR QUÉ EXISTE
 * Varias acciones hacían `await supabase.from(...).update(...)` sin mirar el
 * resultado, envueltas en un `catch` vacío. Si la política de seguridad
 * bloqueaba la operación o la base fallaba, no pasaba absolutamente nada: ni
 * cambio, ni mensaje, ni registro. El embajador tocaba "Publicar", la noticia
 * seguía en borrador y nadie se enteraba nunca.
 *
 * Una acción que falla en silencio es peor que una que falla con un error: la
 * persona cree que funcionó y se va. Al lanzar, la pantalla de error avisa y el
 * fallo queda registrado.
 */
export function exigirOk(
  res: { error: { message?: string; code?: string } | null },
  donde: string,
): void {
  if (!res.error) return;
  const { mensaje } = traducirYReportar(res.error, { admin: true, donde });
  throw new Error(mensaje);
}

/**
 * Traduce y, si el problema es de configuración, avisa por Sentry.
 *
 * Solo se reportan los de configuración: son raros, siempre accionables y
 * significan que algo del sistema está mal montado. Los errores normales (un
 * título repetido, una sesión vencida) no se reportan — son parte del uso
 * cotidiano y solo gastarían la cuota sin decir nada útil.
 */
export function traducirYReportar(
  entrada: unknown,
  opciones: { admin?: boolean; donde?: string } = {},
): ErrorTraducido {
  const t = traducirError(entrada, opciones);

  if (t.configuracion) {
    const original = String((entrada as { message?: string })?.message ?? entrada ?? "");
    Sentry.captureMessage(`Configuración: ${t.mensaje}`, {
      level: "error",
      tags: { tipo: "configuracion", migracion: t.migracion ?? "desconocida" },
      extra: { original, donde: opciones.donde ?? "sin especificar" },
    });
  }

  return t;
}
