"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export type ActionState = { ok: boolean; error?: string; message?: string };

const MODALITIES = ["presencial", "virtual", "ambas"];

async function assertAmbassador() {
  const user = await getSessionUser();
  if (user?.role !== "ambassador" || !user.university_id) {
    throw new Error("No autorizado.");
  }
  return user;
}

export async function createProfessor(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();

    const name = String(formData.get("name") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim() || null;
    const modality = String(formData.get("modality") ?? "ambas");
    const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
    const subjects = String(formData.get("subjects") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name) return { ok: false, error: "El nombre es obligatorio." };
    if (!MODALITIES.includes(modality)) return { ok: false, error: "Modalidad inválida." };

    const supabase = await createClient();
    const { error } = await supabase.from("professors").insert({
      name,
      title,
      modality,
      whatsapp,
      subjects,
      status: "draft",
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/panel/profesores");
    return { ok: true, message: "Profesor cargado como borrador." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function setProfessorStatus(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["draft", "published", "archived"].includes(status)) return;

    const supabase = await createClient();
    await supabase.from("professors").update({ status }).eq("id", id);
    revalidatePath("/panel/profesores");
  } catch {
    // no-op
  }
}

export async function deleteProfessor(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("professors").delete().eq("id", id);
    revalidatePath("/panel/profesores");
  } catch {
    // no-op
  }
}
