import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Consultas del panel del embajador, SIEMPRE acotadas a su universidad.
 *
 * POR QUÉ EXISTE — un incidente real
 * Las listas del panel consultaban la tabla entera y confiaban en que las
 * políticas de la base filtraran. Pero la política de lectura dice, con toda
 * razón:
 *
 *     status = 'published'  OR  admin  OR  (embajador AND es su universidad)
 *
 * Ese primer término es imprescindible: sin él, un visitante anónimo no podría
 * ver nada del sitio público. Y es justamente el que abría la puerta — el panel
 * de una embajadora le mostraba lo suyo MÁS todo lo publicado por las demás
 * universidades.
 *
 * O sea: la base estaba bien, el panel estaba mal. No alcanzaba con delegar el
 * filtrado; hay que pedir explícitamente lo propio.
 *
 * Escribir NUNCA estuvo en riesgo: para modificar o borrar, las políticas sí
 * exigen que sea la universidad de quien lo pide. Era una fuga de lectura.
 *
 * CÓMO SE USA
 * Todo módulo de contenido del panel arranca sus consultas con `deMiUniversidad`
 * en vez de tocar `supabase.from(...)` directamente. Así el filtro no se puede
 * olvidar: viene puesto.
 *
 *     const { tabla, universityId } = await deMiUniversidad("drives");
 *     const { data, count } = await tabla
 *       .select("id, owner", { count: "exact" })
 *       .is("deleted_at", null);
 */

/** Tablas de contenido que un embajador administra en su panel. */
export type TablaDelPanel = "news" | "opportunities" | "professors" | "drives";

/**
 * Devuelve la tabla ya filtrada por la universidad de quien tiene la sesión.
 *
 * Si no hay sesión de embajador válida, manda al login: una consulta sin
 * universidad no debe llegar nunca a la base.
 */
export async function deMiUniversidad(tabla: TablaDelPanel) {
  const user = await getSessionUser();
  if (user?.role !== "ambassador" || !user.university_id) redirect("/login");
  const universityId = user.university_id;

  const supabase = await createClient();
  return {
    universityId,
    /**
     * Empieza una consulta de esa tabla YA acotada a la universidad.
     * Se encadena normal: .is(), .order(), .range(), lo que haga falta.
     */
    consultar: (columnas: string, opciones?: { count?: "exact" }) =>
      supabase.from(tabla).select(columnas, opciones).eq("university_id", universityId),
  };
}
