"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import { traducirYReportar, exigirOk } from "@/lib/errores";
import { texto, LIMITES } from "@/lib/validar";
import { normalizarRed, normalizarMail } from "@/lib/redes";

export type ActionState = { ok: boolean; error?: string; message?: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Traduce errores técnicos a mensajes claros para el admin.
 *
 * Usa el traductor compartido con el panel del embajador, pero en modo admin:
 * cuando el problema es de configuración, agrega qué migración lo resuelve.
 */
function friendly(msg: unknown): string {
  return traducirYReportar(msg, { admin: true, donde: "panel de administración" }).mensaje;
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
    if (error) return { ok: false, error: friendly(error) };

    revalidatePath("/admin");
    return { ok: true, message: `Universidad "${name}" creada.` };
  } catch (e) {
    return { ok: false, error: friendly(e) };
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
    if (createErr) return { ok: false, error: friendly(createErr) };

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
    if (profileErr) return { ok: false, error: friendly(profileErr) };

    await admin
      .from("ambassador_profiles")
      .upsert({ university_id, profile_id: userId }, { onConflict: "university_id" });

    revalidatePath("/admin");
    revalidatePath("/campus");
    return { ok: true, message: `Embajador ${email} creado.` };
  } catch (e) {
    return { ok: false, error: friendly(e) };
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
    exigirOk(await supabase.from("universities").update({ status }).eq("id", id), "activar/desactivar universidad");

    revalidatePath("/admin");
    revalidatePath("/campus");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
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
    exigirOk(
      await supabase.from("profiles").update({ status }).eq("id", id).eq("role", "ambassador"),
      "suspender/reactivar embajador",
    );

    revalidatePath("/admin");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
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

    const display_name = texto(formData.get("display_name"), "El nombre", LIMITES.nombre);
    const presentation = texto(
      formData.get("presentation"),
      "La presentación",
      LIMITES.presentacion,
    );
    const bio = texto(formData.get("bio"), "La bio corta", LIMITES.bioCorta);
    const bio_full = texto(formData.get("bio_full"), "La bio completa", LIMITES.bioLarga);

    // Redes: se acepta el nombre de usuario suelto (@juanperez), el dominio con
    // usuario, o el enlace completo. Se guarda siempre la URL limpia, sin los
    // parámetros de seguimiento que se pegan al copiar desde una app.
    // Antes había que armar las cuatro URLs a mano, por cada embajador.
    const email = normalizarMail(formData.get("email"));
    const instagram = normalizarRed(formData.get("instagram"), "instagram");
    const tiktok = normalizarRed(formData.get("tiktok"), "tiktok");
    const youtube = normalizarRed(formData.get("youtube"), "youtube");
    const linkedin = normalizarRed(formData.get("linkedin"), "linkedin");

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
      if (upErr) return { ok: false, error: friendly(upErr) };
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
    if (error) return { ok: false, error: friendly(error) };

    revalidatePath("/admin");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/");
    return { ok: true, message: "Perfil del embajador actualizado." };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/** Refresca todo lo que puede verse afectado por un cambio de contenido. */
function revalidarTodo() {
  revalidatePath("/admin", "layout");
  revalidatePath("/panel", "layout");
  revalidatePath("/campus");
  revalidatePath("/campus/[university]", "page");
  revalidatePath("/novedades");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Papelera: "Borrar" ya no destruye. Marca deleted_at y baja el elemento de
// público; el dato queda recuperable desde /admin/papelera. El borrado
// definitivo es una segunda acción, explícita, dentro de la papelera.
// ---------------------------------------------------------------------------

/** Manda una universidad a la papelera (deja de verse, no se pierde). */
export async function deleteUniversity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const admin = createAdminClient();
    const { error } = await admin
      .from("universities")
      .update({ deleted_at: new Date().toISOString(), status: "inactive" })
      .eq("id", id);
    if (error) return { ok: false, error: friendly(error) };

    revalidarTodo();
    return { ok: true, message: "Universidad enviada a la papelera." };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/** Manda un embajador a la papelera: no puede ingresar, pero la cuenta existe. */
export async function deleteAmbassador(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const admin = createAdminClient();
    // Guarda: nunca tocar a un admin por este camino.
    const { data: prof } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
    if (!prof) return { ok: false, error: "No se encontró ese embajador." };
    if (prof.role !== "ambassador") return { ok: false, error: "Solo se pueden borrar embajadores." };

    const { error } = await admin
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), status: "suspended" })
      .eq("id", id);
    if (error) return { ok: false, error: friendly(error) };

    revalidarTodo();
    return { ok: true, message: "Embajador enviado a la papelera." };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/** Manda una publicación a la papelera. */
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
    const { error } = await admin
      .from(table)
      .update({ deleted_at: new Date().toISOString(), status: "archived" })
      .eq("id", id);
    if (error) return { ok: false, error: friendly(error) };

    revalidarTodo();
    return { ok: true, message: "Publicación enviada a la papelera." };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/** Saca un elemento de la papelera y lo devuelve como borrador / inactivo. */
export async function restoreItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const table = String(formData.get("table") ?? "");
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const admin = createAdminClient();
    if (table === "universities" || table === "profiles" || CONTENT_TABLES.includes(table as ContentTable)) {
      const { error } = await admin.from(table).update({ deleted_at: null }).eq("id", id);
      if (error) return { ok: false, error: friendly(error) };
    } else {
      return { ok: false, error: "Datos inválidos." };
    }

    revalidarTodo();
    // Restaurar NO devuelve el acceso ni republica: eso se decide aparte, a
    // propósito. Pero el aviso tiene que decir qué falta hacer, y no es lo
    // mismo para una cuenta que para una publicación.
    return {
      ok: true,
      message:
        table === "profiles"
          ? "Cuenta restaurada, pero sigue SUSPENDIDA: no puede entrar al panel todavía. Reactivala desde Embajadores."
          : table === "universities"
            ? "Universidad restaurada, pero sigue INACTIVA: no aparece en el campus. Activala desde Universidades."
            : "Restaurado como borrador: revisalo y publicalo cuando quieras.",
    };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/** Borrado definitivo desde la papelera. Esto sí es irreversible. */
export async function purgeItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const table = String(formData.get("table") ?? "");
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const admin = createAdminClient();

    if (table === "profiles") {
      const { data: prof } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
      if (prof?.role !== "ambassador") return { ok: false, error: "Solo se pueden borrar embajadores." };
      const { error } = await admin.from("profiles").delete().eq("id", id);
      if (error) return { ok: false, error: friendly(error) };
      await admin.auth.admin.deleteUser(id); // recién acá desaparece la cuenta
    } else if (table === "universities" || CONTENT_TABLES.includes(table as ContentTable)) {
      const { error } = await admin.from(table).delete().eq("id", id);
      if (error) return { ok: false, error: friendly(error) };
    } else {
      return { ok: false, error: "Datos inválidos." };
    }

    revalidarTodo();
    return { ok: true, message: "Eliminado definitivamente." };
  } catch (e) {
    return { ok: false, error: friendly(e) };
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
    exigirOk(await supabase.from(table).update({ status: "archived" }).eq("id", id), "despublicar contenido");

    revalidatePath("/admin");
    revalidatePath("/campus/[university]", "page");
    if (table === "news") revalidatePath("/novedades");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
  }
}
