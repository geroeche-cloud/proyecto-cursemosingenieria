import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "ambassador";
  university_id: string | null;
  status: "active" | "suspended";
};

/**
 * Devuelve el usuario autenticado + su perfil (rol, universidad) o null.
 * Verifica la sesión contra Supabase (no confía en cookies sin validar).
 *
 * Envuelto en cache() de React: el layout y la página piden el usuario por
 * separado, y sin esto cada pantalla del panel hacía DOS validaciones de sesión
 * contra Supabase y DOS consultas al perfil, en cadena, antes de empezar a
 * traer los datos de verdad. Ahora la primera llamada del render se comparte
 * con todas las demás. El caché dura lo que dura ese request: no hay riesgo de
 * servirle a alguien la sesión de otro.
 */
export const getSessionUser = cache(async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, university_id, status")
    .eq("id", user.id)
    .single();

  return (profile as SessionUser | null) ?? null;
});
