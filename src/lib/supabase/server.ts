import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./env";

/**
 * Cliente para Server Components, Server Actions y Route Handlers.
 * Lee la sesión desde las cookies → cada consulta respeta RLS por usuario.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component (no puede escribir cookies durante
          // el render). El proxy (proxy.ts) refresca la sesión en cada request.
        }
      },
    },
  });
}
