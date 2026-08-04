import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./env";

/** Cliente para Client Components (navegador). Usa la sesión del usuario. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
