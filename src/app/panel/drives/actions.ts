"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { traducirYReportar, exigirOk } from "@/lib/errores";
import { urlSegura } from "@/lib/url";

export type ActionState = { ok: boolean; error?: string; message?: string };

async function assertAmbassador() {
  const user = await getSessionUser();
  if (user?.role !== "ambassador" || !user.university_id) {
    throw new Error("No autorizado.");
  }
  return user;
}

export async function createDrive(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();

    const owner = String(formData.get("owner") ?? "").trim();
    const career = String(formData.get("career") ?? "").trim() || null;
    const href = urlSegura(String(formData.get("href") ?? ""));

    if (!owner) return { ok: false, error: "El nombre de quien comparte es obligatorio." };

    const publish = String(formData.get("intent") ?? "") === "publish";

    const supabase = await createClient();
    const { error } = await supabase.from("drives").insert({
      owner,
      career,
      href,
      status: publish ? "published" : "draft",
    });
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/drives");
    if (publish) revalidatePath("/campus/[university]", "page");
    return {
      ok: true,
      message: publish
        ? "Drive publicado. Ya aparece en tu campus."
        : "Drive cargado como borrador.",
    };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function updateDrive(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const owner = String(formData.get("owner") ?? "").trim();
    const career = String(formData.get("career") ?? "").trim() || null;
    const href = urlSegura(String(formData.get("href") ?? ""));
    if (!owner) return { ok: false, error: "El nombre de quien comparte es obligatorio." };

    const supabase = await createClient();
    const { error } = await supabase.from("drives").update({ owner, career, href }).eq("id", id);
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/drives");
    revalidatePath("/campus/[university]", "page");
    return { ok: true, message: "Cambios guardados." };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function setDriveStatus(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["draft", "published", "archived"].includes(status)) return;

    const supabase = await createClient();
    exigirOk(await supabase.from("drives").update({ status }).eq("id", id), "cambiar estado");
    revalidatePath("/panel/drives");
    revalidatePath("/campus/[university]", "page");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
  }
}

export async function deleteDrive(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await createClient();
    exigirOk(await supabase.from("drives").delete().eq("id", id), "borrar");
    revalidatePath("/panel/drives");
    revalidatePath("/campus/[university]", "page");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
  }
}
