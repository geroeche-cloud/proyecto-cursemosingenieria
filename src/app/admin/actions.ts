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
    revalidatePath("/campus");
    return { ok: true, message: `Embajador ${email} creado.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

// ---------------------------------------------------------------------------
// Gestión: activar/desactivar universidades, suspender embajadores, moderar.
// Todas pasan por RLS (solo admin) usando el cliente de servidor.
// ---------------------------------------------------------------------------

const CONTENT_TABLES = ["news", "opportunities", "professors", "drives"] as const;
type ContentTable = (typeof CONTENT_TABLES)[number];

/** Activar / desactivar una universidad (afecta su visibilidad pública). */
export async function setUniversityStatus(formData: FormData) {
  try {
    await assertAdmin();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["active", "inactive"].includes(status)) return;

    const supabase = await createClient();
    await supabase.from("universities").update({ status }).eq("id", id);

    revalidatePath("/admin");
    revalidatePath("/campus");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/");
  } catch {
    // no-op
  }
}

/** Suspender / reactivar un embajador (un suspendido no puede entrar al panel). */
export async function setAmbassadorStatus(formData: FormData) {
  try {
    await assertAdmin();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["active", "suspended"].includes(status)) return;

    const supabase = await createClient();
    await supabase.from("profiles").update({ status }).eq("id", id).eq("role", "ambassador");

    revalidatePath("/admin");
  } catch {
    // no-op
  }
}

/** Perfil público del embajador de una universidad (lo cura el admin). */
export async function saveAmbassadorProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();

    const university_id = String(formData.get("university_id") ?? "");
    if (!university_id) return { ok: false, error: "Elegí una universidad." };

    const display_name = String(formData.get("display_name") ?? "").trim() || null;
    const presentation = String(formData.get("presentation") ?? "").trim() || null;

    const bio = String(formData.get("bio") ?? "").trim() || null;
    if (bio && bio.length > 240) {
      return { ok: false, error: "La bio corta no puede superar los 240 caracteres." };
    }
    const bio_full = String(formData.get("bio_full") ?? "").trim() || null;

    // Redes: se guardan tal cual (URL o mail). Vacío => null.
    const email = String(formData.get("email") ?? "").trim() || null;
    const instagram = String(formData.get("instagram") ?? "").trim() || null;
    const tiktok = String(formData.get("tiktok") ?? "").trim() || null;
    const youtube = String(formData.get("youtube") ?? "").trim() || null;
    const linkedin = String(formData.get("linkedin") ?? "").trim() || null;

    // Foto: si suben un archivo nuevo, lo guardamos en Storage; si no, se
    // conserva la foto actual (o se limpia si tildaron "quitar foto").
    let photo_url = String(formData.get("current_photo_url") ?? "").trim() || null;
    if (String(formData.get("remove_photo") ?? "") === "on") photo_url = null;

    const photo = formData.get("photo_file");
    if (photo instanceof File && photo.size > 0) {
      if (!photo.type.startsWith("image/")) {
        return { ok: false, error: "El archivo debe ser una imagen." };
      }
      if (photo.size > 5 * 1024 * 1024) {
        return { ok: false, error: "La imagen no puede superar los 5 MB." };
      }
      const admin = createAdminClient();
      const ext = (photo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${university_id}/${Date.now()}.${ext || "jpg"}`;
      const { error: upErr } = await admin.storage
        .from("ambassadors")
        .upload(path, photo, { contentType: photo.type, upsert: true });
      if (upErr) return { ok: false, error: friendly(upErr.message) };
      photo_url = admin.storage.from("ambassadors").getPublicUrl(path).data.publicUrl;
    }

    // Trayectoria: una línea por hito, formato "AÑO | título | detalle".
    const trajectory = String(formData.get("trajectory") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length === 1) return { year: "", title: parts[0], detail: "" };
        if (parts.length === 2) return { year: parts[0], title: parts[1], detail: "" };
        return { year: parts[0], title: parts[1], detail: parts.slice(2).join(" · ") };
      })
      .filter((h) => h.title);

    const supabase = await createClient();
    const { error } = await supabase.from("ambassador_profiles").upsert(
      {
        university_id,
        display_name,
        presentation,
        bio,
        bio_full,
        photo_url,
        trajectory,
        email,
        instagram,
        tiktok,
        youtube,
        linkedin,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "university_id" },
    );
    if (error) return { ok: false, error: friendly(error.message) };

    revalidatePath("/admin");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/");
    return { ok: true, message: "Perfil del embajador actualizado." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/** Borrar una universidad y, en cascada, todo su contenido. Irreversible. */
export async function deleteUniversity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    // Cliente service_role: saltea RLS, garantiza el borrado.
    const admin = createAdminClient();
    const { error } = await admin.from("universities").delete().eq("id", id);
    if (error) return { ok: false, error: friendly(error.message) };

    revalidatePath("/admin");
    revalidatePath("/campus");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/");
    return { ok: true, message: "Universidad borrada." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/** Borrar un embajador: su perfil (lista) y su cuenta de acceso (auth). */
export async function deleteAmbassador(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const admin = createAdminClient();
    // Guarda: nunca borrar un admin por este camino.
    const { data: prof } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
    if (!prof) return { ok: false, error: "No se encontró ese embajador." };
    if (prof.role !== "ambassador") return { ok: false, error: "Solo se pueden borrar embajadores." };

    // 1) Borrar la fila de profiles (es lo que aparece en la lista del admin).
    const { error: pErr } = await admin.from("profiles").delete().eq("id", id);
    if (pErr) return { ok: false, error: friendly(pErr.message) };

    // 2) Borrar la cuenta de acceso (auth). Best-effort: el perfil ya no existe.
    await admin.auth.admin.deleteUser(id);

    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true, message: "Embajador borrado." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/** Borrar una publicación definitivamente (de cualquier universidad). */
export async function deleteContent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const table = String(formData.get("table") ?? "") as ContentTable;
    const id = String(formData.get("id") ?? "");
    if (!id || !CONTENT_TABLES.includes(table)) return { ok: false, error: "Datos inválidos." };

    const admin = createAdminClient();
    const { error } = await admin.from(table).delete().eq("id", id);
    if (error) return { ok: false, error: friendly(error.message) };

    revalidatePath("/admin");
    revalidatePath("/campus/[university]", "page");
    if (table === "news") revalidatePath("/novedades");
    return { ok: true, message: "Publicación borrada." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/** Moderación: bajar de público una publicación de cualquier universidad. */
export async function unpublishContent(formData: FormData) {
  try {
    await assertAdmin();
    const table = String(formData.get("table") ?? "") as ContentTable;
    const id = String(formData.get("id") ?? "");
    if (!id || !CONTENT_TABLES.includes(table)) return;

    const supabase = await createClient();
    await supabase.from(table).update({ status: "archived" }).eq("id", id);

    revalidatePath("/admin");
    revalidatePath("/campus/[university]", "page");
    if (table === "news") revalidatePath("/novedades");
  } catch {
    // no-op
  }
}
