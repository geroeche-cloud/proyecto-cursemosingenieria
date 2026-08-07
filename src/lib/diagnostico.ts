// SOLO SERVIDOR: usa la clave de administración.
import { createAdminClient } from "@/lib/supabase/admin";
import { firstToken } from "@/lib/supabase/env";

export type Estado = "ok" | "falla" | "aviso";

export type Chequeo = {
  nombre: string;
  estado: Estado;
  detalle: string;
  /** Qué hacer si falla. Vacío cuando está todo bien. */
  arreglo?: string;
};

/** Ejecuta un chequeo sin que una excepción tumbe todo el diagnóstico. */
async function correr(
  nombre: string,
  fn: () => Promise<Omit<Chequeo, "nombre">>,
): Promise<Chequeo> {
  try {
    return { nombre, ...(await fn()) };
  } catch (e) {
    return {
      nombre,
      estado: "falla",
      detalle: e instanceof Error ? e.message : "Error inesperado",
      arreglo: "Revisá los logs del servidor en Vercel → Runtime Logs.",
    };
  }
}

/**
 * Verifica todo lo que puede romperse en silencio: conexión, migraciones,
 * funciones, variables de entorno y storage.
 *
 * Existe porque tres veces perdimos horas con el sitio "andando" pero algo
 * roto por detrás (variables mal cargadas, una función con error, una
 * migración sin correr). Acá eso se ve en cinco segundos.
 */
export async function correrDiagnostico(): Promise<Chequeo[]> {
  const admin = createAdminClient();

  const chequeos: Chequeo[] = [];

  // ---- Variables de entorno ----
  chequeos.push(
    await correr("Variables de entorno", async () => {
      const url = firstToken(process.env.NEXT_PUBLIC_SUPABASE_URL);
      const anon = firstToken(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const service = firstToken(process.env.SUPABASE_SERVICE_ROLE_KEY);
      const problemas: string[] = [];
      if (!url.startsWith("https://")) problemas.push("la URL no parece válida");
      if (!anon.startsWith("eyJ")) problemas.push("la clave pública no parece un JWT");
      if (!service.startsWith("eyJ")) problemas.push("la clave de administración no parece un JWT");

      // Detecta el error de copiar/pegar que ya nos pasó: texto extra pegado.
      const sucia =
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim() !== anon ||
        (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim() !== service;
      if (sucia) problemas.push("hay texto de más pegado a una clave");

      if (problemas.length > 0) {
        return {
          estado: "falla",
          detalle: problemas.join("; "),
          arreglo:
            "Vercel → Settings → Environment Variables: cada valor en una sola línea, sin comillas ni texto extra. Después, Redeploy.",
        };
      }
      return { estado: "ok", detalle: `Conectado a ${new URL(url).hostname}` };
    }),
  );

  // ---- Conexión a la base ----
  chequeos.push(
    await correr("Conexión a la base de datos", async () => {
      const { error } = await admin.from("universities").select("id").limit(1);
      if (error) {
        return {
          estado: "falla",
          detalle: error.message,
          arreglo: "Verificá que el proyecto de Supabase esté activo y las claves sean correctas.",
        };
      }
      return { estado: "ok", detalle: "Responde correctamente" };
    }),
  );

  // ---- Migración 0008: papelera ----
  chequeos.push(
    await correr("Papelera (migración 0008)", async () => {
      const { error } = await admin.from("news").select("deleted_at").limit(1);
      if (error) {
        return {
          estado: "falla",
          detalle: "Falta la columna deleted_at",
          arreglo: "Correr supabase/migrations/0008_papelera.sql en el SQL Editor.",
        };
      }
      return { estado: "ok", detalle: "Borrar es reversible" };
    }),
  );

  // ---- Migración 0009: registro de eventos ----
  chequeos.push(
    await correr("Registro de eventos (migración 0009)", async () => {
      const { error } = await admin.from("click_events").select("id").limit(1);
      if (error) {
        return {
          estado: "falla",
          detalle: "Falta la tabla click_events",
          arreglo: "Correr supabase/migrations/0009_click_events.sql en el SQL Editor.",
        };
      }
      return { estado: "ok", detalle: "Tabla de eventos disponible" };
    }),
  );

  // ---- Migración 0010/0011: medición operativa ----
  chequeos.push(
    await correr("Medición de impacto (migraciones 0010 y 0011)", async () => {
      // Se llama con una universidad inexistente: la función valida y no hace
      // nada, pero si responde sin error es porque está bien creada.
      const { error } = await admin.rpc("track_event", {
        p_kind: "visit",
        p_row: "00000000-0000-0000-0000-000000000000",
        p_vid: null,
      });
      if (error) {
        const falta = error.code === "PGRST202";
        return {
          estado: "falla",
          detalle: falta ? "La función track_event no existe" : error.message,
          arreglo: falta
            ? "Correr 0010_informes.sql y 0011_fix_ambiguedad.sql en el SQL Editor."
            : "Correr supabase/migrations/0011_fix_ambiguedad.sql (corrige el error de ambigüedad).",
        };
      }
      return { estado: "ok", detalle: "Visitas, clics y redes se registran" };
    }),
  );

  // ---- Funciones de informes ----
  chequeos.push(
    await correr("Informes", async () => {
      const { error } = await admin.rpc("report_stats", { p_uni: null });
      if (error) {
        const sinPermiso = /permission denied/i.test(error.message);
        const noExiste = error.code === "PGRST202";
        return {
          estado: "falla",
          detalle: error.message,
          arreglo: sinPermiso
            ? "Correr supabase/migrations/0012_permisos_informes.sql (le da acceso al rol del servidor)."
            : noExiste
              ? "Correr supabase/migrations/0010_informes.sql en el SQL Editor."
              : "Revisar la función report_stats en Supabase.",
        };
      }
      return { estado: "ok", detalle: "Los informes calculan correctamente" };
    }),
  );

  // ---- Storage de fotos ----
  chequeos.push(
    await correr("Fotos de embajadores (Storage)", async () => {
      const { data, error } = await admin.storage.listBuckets();
      if (error) {
        return {
          estado: "falla",
          detalle: error.message,
          arreglo: "Revisá el acceso a Storage en Supabase.",
        };
      }
      const b = (data ?? []).find((x) => x.id === "ambassadors");
      if (!b) {
        return {
          estado: "falla",
          detalle: "No existe el bucket 'ambassadors'",
          arreglo:
            "Correr la parte de Storage de 0003_ambassador_profile_fields.sql, o crear el bucket público 'ambassadors' en Supabase → Storage.",
        };
      }
      if (!b.public) {
        return {
          estado: "aviso",
          detalle: "El bucket existe pero no es público",
          arreglo: "Marcarlo como público para que las fotos se vean en el sitio.",
        };
      }
      return { estado: "ok", detalle: "Bucket público disponible" };
    }),
  );

  // ---- Contenido publicado ----
  chequeos.push(
    await correr("Contenido en vivo", async () => {
      const [u, n, o, p, d] = await Promise.all([
        admin.from("universities").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
        admin.from("news").select("id", { count: "exact", head: true }).eq("status", "published").is("deleted_at", null),
        admin.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "published").is("deleted_at", null),
        admin.from("professors").select("id", { count: "exact", head: true }).eq("status", "published").is("deleted_at", null),
        admin.from("drives").select("id", { count: "exact", head: true }).eq("status", "published").is("deleted_at", null),
      ]);
      const unis = u.count ?? 0;
      const total = (n.count ?? 0) + (o.count ?? 0) + (p.count ?? 0) + (d.count ?? 0);
      if (unis === 0) {
        return {
          estado: "aviso",
          detalle: "No hay universidades activas",
          arreglo: "Activá al menos una universidad para que el campus público muestre algo.",
        };
      }
      return {
        estado: "ok",
        detalle: `${unis} universidad${unis === 1 ? "" : "es"} activa${unis === 1 ? "" : "s"} · ${total} publicación${total === 1 ? "" : "es"} en vivo`,
      };
    }),
  );

  return chequeos;
}
