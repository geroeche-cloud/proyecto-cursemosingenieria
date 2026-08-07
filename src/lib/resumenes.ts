import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";

/**
 * Resúmenes de los dos paneles de inicio.
 *
 * Antes cada una de esas pantallas se traía TODAS las filas de los cuatro
 * módulos para después contarlas y ordenarlas en JavaScript. Con el contenido
 * de una universidad no se nota; con el de cincuenta son miles de filas
 * viajando por la red para mostrar cuatro números.
 *
 * Ahora lo cuenta la base (migración 0013) y viaja el resultado ya listo.
 *
 * Si la migración todavía no se corrió, se cae al método viejo en vez de
 * romper: correrla mejora el rendimiento, no es un requisito para que el sitio
 * funcione. Nunca hay una ventana en la que el panel quede caído.
 */

const NO_EXISTE = "PGRST202";

export type PanelResumen = {
  conteos: Record<string, { publicadas: number; borradores: number }>;
  ranking: { label: string; tipo: string; clicks: number }[];
};

export type AdminResumen = {
  universidades_activas: number;
  universidades_total: number;
  embajadores_activos: number;
  embajadores_suspendidos: number;
  publicaciones: number;
  clics: number;
  ranking: { label: string; tipo: string; clicks: number; universidad: string | null }[];
  por_universidad: {
    id: string;
    nombre: string;
    activa: boolean;
    publicaciones: number;
    clics: number;
  }[];
};

const MODULOS = ["news", "opportunities", "professors", "drives"] as const;

const ETIQUETA: Record<(typeof MODULOS)[number], string> = {
  news: "Noticia",
  opportunities: "Oportunidad",
  professors: "Profesor",
  drives: "Drive",
};

/** Columna que sirve de título en cada módulo. */
const TITULO: Record<(typeof MODULOS)[number], string> = {
  news: "title",
  opportunities: "title",
  professors: "name",
  drives: "owner",
};

// ---------------------------------------------------------------------------
// Panel del embajador
// ---------------------------------------------------------------------------

export async function getPanelResumen(): Promise<PanelResumen> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("panel_overview");

  if (!error && data) return data as PanelResumen;
  if (error && error.code !== NO_EXISTE) logIfError("panel_overview", error);

  return respaldoPanel();
}

/** Método anterior: se usa solo mientras la migración 0013 no esté corrida. */
async function respaldoPanel(): Promise<PanelResumen> {
  const supabase = await createClient();

  const filas = await Promise.all(
    MODULOS.map((m) => supabase.from(m).select("status").is("deleted_at", null)),
  );
  const tops = await Promise.all(
    MODULOS.map((m) =>
      supabase
        .from(m)
        .select(`${TITULO[m]}, clicks`)
        .is("deleted_at", null)
        .order("clicks", { ascending: false })
        .limit(5),
    ),
  );

  const conteos: PanelResumen["conteos"] = {};
  MODULOS.forEach((m, i) => {
    const rows = (filas[i].data ?? []) as { status: string }[];
    conteos[m] = {
      publicadas: rows.filter((r) => r.status === "published").length,
      borradores: rows.filter((r) => r.status === "draft").length,
    };
  });

  const ranking = MODULOS.flatMap((m, i) =>
    // El select se arma con el nombre de columna de cada módulo, así que el
    // tipado automático de Supabase no puede deducirlo: se afirma a mano.
    ((tops[i].data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
      label:
        m === "drives" ? `Drive de ${String(r[TITULO[m]])}` : String(r[TITULO[m]] ?? ""),
      tipo: ETIQUETA[m],
      clicks: Number(r.clicks ?? 0),
    })),
  )
    .filter((x) => x.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 6);

  return { conteos, ranking };
}

// ---------------------------------------------------------------------------
// Inicio de la administración
// ---------------------------------------------------------------------------

const ADMIN_VACIO: AdminResumen = {
  universidades_activas: 0,
  universidades_total: 0,
  embajadores_activos: 0,
  embajadores_suspendidos: 0,
  publicaciones: 0,
  clics: 0,
  ranking: [],
  por_universidad: [],
};

export async function getAdminResumen(): Promise<AdminResumen> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_overview");

  if (!error && data) return data as AdminResumen;
  if (error && error.code !== NO_EXISTE) logIfError("admin_overview", error);

  return respaldoAdmin();
}

/** Método anterior: se usa solo mientras la migración 0013 no esté corrida. */
async function respaldoAdmin(): Promise<AdminResumen> {
  const supabase = await createClient();

  const [uniRes, ambRes, ...modRes] = await Promise.all([
    supabase.from("universities").select("id, name, short_name, status").is("deleted_at", null),
    supabase.from("profiles").select("status").eq("role", "ambassador").is("deleted_at", null),
    ...MODULOS.map((m) =>
      supabase
        .from(m)
        .select(`${TITULO[m]}, university_id, clicks`)
        .is("deleted_at", null)
        .eq("status", "published"),
    ),
  ]);

  logIfError("admin resumen universities", uniRes.error);
  logIfError("admin resumen profiles", ambRes.error);

  const unis = (uniRes.data ?? []) as {
    id: string;
    name: string;
    short_name: string | null;
    status: string;
  }[];
  const ambs = (ambRes.data ?? []) as { status: string }[];

  const publicado = MODULOS.flatMap((m, i) =>
    ((modRes[i]?.data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
      university_id: String(r.university_id ?? ""),
      label: m === "drives" ? `Drive de ${String(r[TITULO[m]])}` : String(r[TITULO[m]] ?? ""),
      tipo: ETIQUETA[m],
      clicks: Number(r.clicks ?? 0),
    })),
  );

  const nombreDe = new Map(unis.map((u) => [u.id, u.short_name || u.name]));

  return {
    ...ADMIN_VACIO,
    universidades_activas: unis.filter((u) => u.status === "active").length,
    universidades_total: unis.length,
    embajadores_activos: ambs.filter((a) => a.status === "active").length,
    embajadores_suspendidos: ambs.filter((a) => a.status === "suspended").length,
    publicaciones: publicado.length,
    clics: publicado.reduce((n, r) => n + r.clicks, 0),
    ranking: publicado
      .filter((r) => r.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8)
      .map((r) => ({ ...r, universidad: nombreDe.get(r.university_id) ?? null })),
    por_universidad: unis
      .map((u) => {
        const items = publicado.filter((r) => r.university_id === u.id);
        return {
          id: u.id,
          nombre: u.short_name || u.name,
          activa: u.status === "active",
          publicaciones: items.length,
          clics: items.reduce((n, r) => n + r.clicks, 0),
        };
      })
      .sort((a, b) => b.clics - a.clics || b.publicaciones - a.publicaciones),
  };
}
