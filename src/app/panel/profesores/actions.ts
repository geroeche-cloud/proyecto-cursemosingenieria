"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { traducirYReportar, exigirOk } from "@/lib/errores";
import { texto, lista, LIMITES } from "@/lib/validar";

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

    const name = texto(formData.get("name"), "El nombre", LIMITES.nombre, true)!;
    const title = texto(formData.get("title"), "El cargo", LIMITES.cargo);
    const modality = String(formData.get("modality") ?? "ambas");
    const whatsapp = texto(formData.get("whatsapp"), "El WhatsApp", LIMITES.whatsapp);
    // Las materias llegan como varios campos con el mismo nombre. Se unen con
    // saltos de linea para validarlas con la misma regla que cualquier lista.
    const subjects = lista(
      formData.getAll("subjects").map((s) => String(s)).join("`n"),
      "Las materias",
      LIMITES.materias,
    );

    if (!MODALITIES.includes(modality)) return { ok: false, error: "Modalidad inválida." };

    const publish = String(formData.get("intent") ?? "") === "publish";

    const supabase = await createClient();
    const { error } = await supabase.from("professors").insert({
      name,
      title,
      modality,
      whatsapp,
      subjects,
      status: publish ? "published" : "draft",
    });
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/profesores");
    if (publish) revalidatePath("/campus/[university]", "page");
    return {
      ok: true,
      message: publish
        ? "Profesor publicado. Ya aparece en tu campus."
        : "Profesor cargado como borrador.",
    };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function updateProfessor(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const name = texto(formData.get("name"), "El nombre", LIMITES.nombre, true)!;
    const title = texto(formData.get("title"), "El cargo", LIMITES.cargo);
    const modality = String(formData.get("modality") ?? "ambas");
    const whatsapp = texto(formData.get("whatsapp"), "El WhatsApp", LIMITES.whatsapp);
    // Las materias llegan como varios campos con el mismo nombre. Se unen con
    // saltos de linea para validarlas con la misma regla que cualquier lista.
    const subjects = lista(
      formData.getAll("subjects").map((s) => String(s)).join("`n"),
      "Las materias",
      LIMITES.materias,
    );

    if (!MODALITIES.includes(modality)) return { ok: false, error: "Modalidad inválida." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("professors")
      .update({ name, title, modality, whatsapp, subjects })
      .eq("id", id);
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/profesores");
    revalidatePath("/campus/[university]", "page");
    return { ok: true, message: "Cambios guardados." };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function setProfessorStatus(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["draft", "published", "archived"].includes(status)) return;

    const supabase = await createClient();
    exigirOk(await supabase.from("professors").update({ status }).eq("id", id), "cambiar estado");
    revalidatePath("/panel/profesores");
    revalidatePath("/campus/[university]", "page");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
  }
}

export async function deleteProfessor(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await createClient();
    exigirOk(await supabase.from("professors").delete().eq("id", id), "borrar");
    revalidatePath("/panel/profesores");
    revalidatePath("/campus/[university]", "page");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
  }
}
