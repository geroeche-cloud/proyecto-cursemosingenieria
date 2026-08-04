import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "./env";

/**
 * Cliente anónimo SIN cookies — para páginas públicas cacheables (ISR).
 * No lee sesión, así la página puede renderizarse estáticamente y el tráfico de
 * lectura no depende de la base en vivo. RLS solo deja ver contenido publicado.
 */
export function createPublicClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
