import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, firstToken } from "./env";

/**
 * Cliente con service_role: SALTEA RLS.
 * Solo para operaciones de administración en el SERVIDOR (crear usuarios,
 * asignar embajadores). Nunca debe importarse ni ejecutarse en el navegador.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() es solo de servidor.");
  }

  // Mismo saneo que la anon key: recorta espacios/saltos y texto pegado por error.
  const serviceKey = firstToken(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY (solo servidor) en .env.local o en Vercel.");
  }
  if (!serviceKey.startsWith("eyJ")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no parece una key válida (debe empezar con 'eyJ'). " +
        "Revisá que no tenga saltos de línea ni texto pegado.",
    );
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
