"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Solo un admin autenticado puede ejecutar estas acciones. */
async function assertAdmin() {
  const user = await getSessionUser();
  if (user?.role !== "admin") throw new Error("No autorizado.");
  return user;
}

export async function createUniversity(formData: FormData) {
  await assertAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("universities").insert({
    name,
    short_name,
    city,
    slug: slugify(short_name || name),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function createAmbassador(formData: FormData) {
  await assertAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim() || null;
  const university_id = String(formData.get("university_id") ?? "");
  if (!email || !password || !university_id) return;

  // Crear el usuario de Auth requiere privilegios de administración (service_role).
  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createErr) throw new Error(createErr.message);

  const userId = created.user?.id;
  if (!userId) throw new Error("No se pudo crear la cuenta.");

  const { error: profileErr } = await admin.from("profiles").upsert({
    id: userId,
    email,
    full_name,
    role: "ambassador",
    university_id,
    status: "active",
  });
  if (profileErr) throw new Error(profileErr.message);

  // Reservar el perfil institucional (lo completa luego el equipo central).
  await admin
    .from("ambassador_profiles")
    .upsert({ university_id, profile_id: userId }, { onConflict: "university_id" });

  revalidatePath("/admin");
}
