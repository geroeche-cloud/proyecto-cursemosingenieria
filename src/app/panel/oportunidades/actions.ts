"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

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
    const title = String(formData.get("title") ?? "").trim();
    const org = String(formData.get("org") ?? "").trim() || null;
    const description = String(formData.get("description") ?? "").trim() || null;
    const deadline = String(formData.get("deadline") ?? "").trim() || null;
    const href = String(formData.get("href") ?? "").trim() || null;
    const starts_at = String(formData.get("starts_at") ?? "").trim() || null;
    const ends_at = String(formData.get("ends_at") ?? "").trim() || null;
    const requirements = String(formData.get("requirements") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!title) return { ok: false, error: "El título es obligatorio." };
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
    if (error) return { ok: false, error: error.message };

    revalidatePath("/panel/oportunidades");
    if (publish) revalidatePath("/campus/[university]", "page");
    return {
      ok: true,
      message: publish
        ? "Oportunidad publicada. Ya aparece en tu campus."
        : "Oportunidad creada como borrador.",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
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
    const title = String(formData.get("title") ?? "").trim();
    const org = String(formData.get("org") ?? "").trim() || null;
    const description = String(formData.get("description") ?? "").trim() || null;
    const deadline = String(formData.get("deadline") ?? "").trim() || null;
    const href = String(formData.get("href") ?? "").trim() || null;
    const starts_at = String(formData.get("starts_at") ?? "").trim() || null;
    const ends_at = String(formData.get("ends_at") ?? "").trim() || null;
    const requirements = String(formData.get("requirements") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!title) return { ok: false, error: "El título es obligatorio." };
    if (!KINDS.includes(kind)) return { ok: false, error: "Tipo inválido." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("opportunities")
      .update({ kind, title, org, description, deadline, href, requirements, starts_at, ends_at })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/panel/oportunidades");
    revalidatePath("/campus/[university]", "page");
    return { ok: true, message: "Cambios guardados." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function setOpportunityStatus(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["draft", "published", "archived"].includes(status)) return;

    const supabase = await createClient();
    await supabase
      .from("opportunities")
      .update({
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    revalidatePath("/panel/oportunidades");
    revalidatePath("/campus/[university]", "page");
  } catch {
    // no-op: la UI se mantiene; se puede reintentar.
  }
}

export async function deleteOpportunity(formData: FormData) {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("opportunities").delete().eq("id", id);

    revalidatePath("/panel/oportunidades");
    revalidatePath("/campus/[university]", "page");
  } catch {
    // no-op
  }
}
