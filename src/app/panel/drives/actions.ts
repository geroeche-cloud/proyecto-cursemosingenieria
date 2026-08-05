"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

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
    const href = String(formData.get("href") ?? "").trim() || null;

    if (!owner) return { ok: false, error: "El nombre de quien comparte es obligatorio." };

    const supabase = await createClient();
    const { error } = await supabase.from("drives").insert({
      owner,
      career,
      href,
      status: "draft",
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/panel/drives");
    return { ok: true, message: "Drive cargado como borrador." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function setDriveStatus(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["draft", "published", "archived"].includes(status)) return;

    const supabase = await createClient();
    await supabase.from("drives").update({ status }).eq("id", id);
    revalidatePath("/panel/drives");
  } catch {
    // no-op
  }
}

export async function deleteDrive(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("drives").delete().eq("id", id);
    revalidatePath("/panel/drives");
  } catch {
    // no-op
  }
}
