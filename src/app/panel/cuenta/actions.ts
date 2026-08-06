"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export type ActionState = { ok: boolean; error?: string; message?: string };

/** El embajador cambia su propia contraseña (la temporal que le creó el admin). */
export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "No autorizado." };

    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password.length < 8) {
      return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
    }
    if (password !== confirm) {
      return { ok: false, error: "Las contraseñas no coinciden." };
    }

    // La sesión del propio usuario autoriza el cambio (no hace falta la anterior).
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: error.message };

    return { ok: true, message: "Contraseña actualizada. Usala la próxima vez que ingreses." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
