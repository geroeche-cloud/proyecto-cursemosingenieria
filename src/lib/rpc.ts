import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/env";

/**
 * Llamada mínima a una función de la base desde el navegador.
 *
 * POR QUÉ EXISTE
 * El sitio público solo necesita avisar "alguien hizo clic acá". Para eso
 * usaba el SDK de Supabase, que pesa 275 KB y trae autenticación, realtime,
 * storage y gestión de sesión — nada de lo cual se usa en una página pública.
 * Cada visitante descargaba esos 275 KB para disparar un POST de dos campos.
 *
 * Esto hace exactamente el mismo pedido HTTP, en unas pocas líneas.
 *
 * keepalive: true — el pedido sobrevive a que la persona se vaya de la página.
 * Es justo lo que pasa al hacer clic en un enlace externo: sin esto el
 * navegador cancela el aviso a mitad de camino y el clic no se registra.
 */
export type RpcError = { code?: string; message: string };

export async function llamarRpc(
  fn: string,
  args: Record<string, unknown>,
): Promise<{ error?: RpcError }> {
  if (!supabaseUrl || !supabaseAnonKey) return { error: { message: "Sin configurar" } };

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        // Sin cuerpo de respuesta: no nos interesa el resultado, solo que llegue.
        Prefer: "return=minimal",
      },
      body: JSON.stringify(args),
      keepalive: true,
    });

    if (res.ok) return {};

    // PostgREST devuelve el detalle del error en JSON.
    const cuerpo = await res.json().catch(() => null);
    return {
      error: {
        code: cuerpo?.code,
        message: cuerpo?.message ?? `HTTP ${res.status}`,
      },
    };
  } catch (e) {
    return { error: { message: e instanceof Error ? e.message : "Error de red" } };
  }
}
