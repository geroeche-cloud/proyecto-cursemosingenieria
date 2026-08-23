"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { traducirYReportar, exigirOk } from "@/lib/errores";
import { urlSegura } from "@/lib/url";
import { texto, fecha, rangoDeFechas, lista, LIMITES } from "@/lib/validar";

export type ActionState = { ok: boolean; error?: string; message?: string };

const KINDS = ["beca", "pasantia", "programa", "evento", "competencia", "noticia"];

async function assertAmbassador() {
  const user = await getSessionUser();
  if (user?.role !== "ambassador" || !user.university_id) {
    throw new Error("No autorizado.");
  }
  return user;
}

export async function createOpportunity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();

    const kind = String(formData.get("kind") ?? "beca");
    const title = texto(formData.get("title"), "El titulo", LIMITES.titulo, true)!;
    const org = texto(formData.get("org"), "La organizacion", LIMITES.organizacion);
    const description = texto(formData.get("description"), "La descripcion", LIMITES.descripcion);
    const deadline = texto(formData.get("deadline"), "La fecha limite", LIMITES.fechaLimite);
    const href = urlSegura(String(formData.get("href") ?? ""));
    const starts_at = fecha(formData.get("starts_at"), "La fecha de inicio");
    const ends_at = fecha(formData.get("ends_at"), "La fecha de fin");
    rangoDeFechas(starts_at, ends_at);
    const requirements = lista(formData.get("requirements"), "Los requisitos", LIMITES.requisitos);

    if (!KINDS.includes(kind)) return { ok: false, error: "Tipo inválido." };

    const publish = String(formData.get("intent") ?? "") === "publish";

    const supabase = await createClient();
    const { error } = await supabase.from("opportunities").insert({
      kind,
      title,
      org,
      description,
      deadline,
      href,
      requirements,
      starts_at,
      ends_at,
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    });
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/oportunidades");
    if (publish) {
      revalidatePath("/campus/[university]", "page");
      // La oportunidad tiene además página propia; sin esto, editarla o
      // borrarla dejaría la versión vieja servida hasta un minuto.
      revalidatePath("/campus/[university]/oportunidad/[id]", "page");
    }
    return {
      ok: true,
      message: publish
        ? "Oportunidad publicada. Ya aparece en tu campus."
        : "Oportunidad creada como borrador.",
    };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function updateOpportunity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const kind = String(formData.get("kind") ?? "beca");
    const title = texto(formData.get("title"), "El titulo", LIMITES.titulo, true)!;
    const org = texto(formData.get("org"), "La organizacion", LIMITES.organizacion);
    const description = texto(formData.get("description"), "La descripcion", LIMITES.descripcion);
    const deadline = texto(formData.get("deadline"), "La fecha limite", LIMITES.fechaLimite);
    const href = urlSegura(String(formData.get("href") ?? ""));
    const starts_at = fecha(formData.get("starts_at"), "La fecha de inicio");
    const ends_at = fecha(formData.get("ends_at"), "La fecha de fin");
    rangoDeFechas(starts_at, ends_at);
    const requirements = lista(formData.get("requirements"), "Los requisitos", LIMITES.requisitos);

    if (!KINDS.includes(kind)) return { ok: false, error: "Tipo inválido." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("opportunities")
      .update({ kind, title, org, description, deadline, href, requirements, starts_at, ends_at })
      .eq("id", id);
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/oportunidades");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/campus/[university]/oportunidad/[id]", "page");
    return { ok: true, message: "Cambios guardados." };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function setOpportunityStatus(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["draft", "published", "archived"].includes(status)) return;

    const supabase = await createClient();
    exigirOk(
      await supabase
        .from("opportunities")
        .update({
          status,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .eq("id", id),
      "cambiar estado de oportunidad",
    );

    revalidatePath("/panel/oportunidades");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/campus/[university]/oportunidad/[id]", "page");
  } catch (e) {
    // Una acción que falla en silencio es peor que una que avisa: la persona
    // cree que funcionó y se va. Se propaga para que se vea.
    throw e instanceof Error ? e : new Error("No se pudo completar la acción.");
  }
}

export async function deleteOpportunity(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await createClient();
    exigirOk(await supabase.from("opportunities").delete().eq("id", id), "borrar");

    revalidatePath("/panel/oportunidades");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/campus/[university]/oportunidad/[id]", "page");
  } catch (e) {
    throw e instanceof Error ? e : new Error("No se pudo completar la accion.");
  }
}
