import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role: SALTEA RLS.
 * Solo para operaciones de administración en el SERVIDOR (crear usuarios,
 * asignar embajadores). Nunca debe importarse ni ejecutarse en el navegador.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() es solo de servidor.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (solo servidor) en .env.local.",
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
