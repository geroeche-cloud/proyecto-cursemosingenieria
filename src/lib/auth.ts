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
 */
export async function getSessionUser(): Promise<SessionUser | null> {
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
}
