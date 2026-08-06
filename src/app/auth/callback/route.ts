import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de autenticación (flujo PKCE de Supabase). El email de recuperación
 * de contraseña redirige acá con un ?code=...; lo intercambiamos por una sesión
 * y mandamos al usuario a la página indicada en ?next (por defecto /panel).
 * No usa service_role: es el propio usuario autenticándose con su enlace.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/panel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=enlace", request.url));
}
