"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";

export type ActionState = { ok: boolean; error?: string; message?: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Traduce errores técnicos a mensajes claros para el admin. */
function friendly(msg: string): string {
  if (/already been registered/i.test(msg)) {
    return "Ese email ya tiene una cuenta. Usá uno distinto.";
  }
  if (/password/i.test(msg) && /(least|length|weak|short|6)/i.test(msg)) {
    return "La contraseña es muy corta. Usá al menos 8 caracteres.";
  }
  if (/duplicate key|unique/i.test(msg)) {
    return "Ya existe una universidad con ese nombre o sigla.";
  }
  return msg;
}

async function assertAdmin() {
  const user = await getSessionUser();
  if (user?.role !== "admin") throw new Error("No autorizado.");
  return user;
}

export async function createUniversity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const short_name = String(formData.get("short_name") ?? "").trim() || null;
    const city = String(formData.get("city") ?? "").trim() || null;
    if (!name) return { ok: false, error: "El nombre es obligatorio." };

    const supabase = await createClient();
    const { error } = await supabase.from("universities").insert({
      name,
      short_name,
      city,
      slug: slugify(short_name || name),
    });
    if (error) return { ok: false, error: friendly(error.message) };

    revalidatePath("/admin");
    return { ok: true, message: `Universidad "${name}" creada.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function createAmbassador(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const full_name = String(formData.get("full_name") ?? "").trim() || null;
    const university_id = String(formData.get("university_id") ?? "");

    if (!email || !password || !university_id) {
      return { ok: false, error: "Completá email, contraseña y universidad." };
    }
    if (password.length < 8) {
      return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
    }

    const admin = createAdminClient();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (createErr) return { ok: false, error: friendly(createErr.message) };

    const userId = created.user?.id;
    if (!userId) return { ok: false, error: "No se pudo crear la cuenta." };

    const { error: profileErr } = await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name,
      role: "ambassador",
      university_id,
      status: "active",
    });
    if (profileErr) return { ok: false, error: friendly(profileErr.message) };

    await admin
      .from("ambassador_profiles")
      .upsert({ university_id, profile_id: userId }, { onConflict: "university_id" });

    revalidatePath("/admin");
    return { ok: true, message: `Embajador ${email} creado.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
