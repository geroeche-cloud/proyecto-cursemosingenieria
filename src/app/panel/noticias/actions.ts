"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { traducirYReportar } from "@/lib/errores";
import { texto, fecha, rangoDeFechas, LIMITES } from "@/lib/validar";

export type ActionState = { ok: boolean; error?: string; message?: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function assertAmbassador() {
  const user = await getSessionUser();
  if (user?.role !== "ambassador" || !user.university_id) {
    throw new Error("No autorizado.");
  }
  return user;
}

export async function createNews(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();

    const title = texto(formData.get("title"), "El titulo", LIMITES.titulo, true)!;
    const summary = texto(formData.get("summary"), "El resumen", LIMITES.resumen);
    const body = texto(formData.get("body"), "El cuerpo", LIMITES.cuerpo);
    const starts_at = fecha(formData.get("starts_at"), "La fecha de inicio");
    const ends_at = fecha(formData.get("ends_at"), "La fecha de fin");
    rangoDeFechas(starts_at, ends_at);
    const publish = String(formData.get("intent") ?? "") === "publish";

    const supabase = await createClient();
    const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

    const { error } = await supabase.from("news").insert({
      title,
      slug,
      summary,
      body,
      starts_at,
      ends_at,
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    });
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/noticias");
    if (publish) {
      revalidatePath("/novedades");
      revalidatePath("/campus/[university]", "page");
      // La noticia tiene además página propia; sin esto, editarla o borrarla
      // dejaría la versión vieja servida hasta un minuto.
      revalidatePath("/campus/[university]/noticia/[id]", "page");
    }
    return {
      ok: true,
      message: publish ? "Noticia publicada." : "Noticia guardada como borrador.",
    };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function updateNews(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAmbassador();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Falta el identificador." };

    const title = texto(formData.get("title"), "El titulo", LIMITES.titulo, true)!;
    const summary = texto(formData.get("summary"), "El resumen", LIMITES.resumen);
    const body = texto(formData.get("body"), "El cuerpo", LIMITES.cuerpo);
    const starts_at = fecha(formData.get("starts_at"), "La fecha de inicio");
    const ends_at = fecha(formData.get("ends_at"), "La fecha de fin");
    rangoDeFechas(starts_at, ends_at);

    const supabase = await createClient();
    const { error } = await supabase
      .from("news")
      .update({ title, summary, body, starts_at, ends_at })
      .eq("id", id);
    if (error) return { ok: false, error: traducirYReportar(error).mensaje };

    revalidatePath("/panel/noticias");
    revalidatePath("/novedades");
    revalidatePath("/campus/[university]", "page");
    revalidatePath("/campus/[university]/noticia/[id]", "page");
    return { ok: true, message: "Cambios guardados." };
  } catch (e) {
    return { ok: false, error: traducirYReportar(e).mensaje };
  }
}

export async function setNewsStatus(formData: FormData) {
  await assertAmbassador();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "published", "archived"].includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("news")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(traducirYReportar(error).mensaje);

  revalidatePath("/panel/noticias");
  revalidatePath("/novedades");
  revalidatePath("/campus/[university]", "page");
  revalidatePath("/campus/[university]/noticia/[id]", "page");
}

export async function deleteNews(formData: FormData) {
  await assertAmbassador();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(traducirYReportar(error).mensaje);

  revalidatePath("/panel/noticias");
  revalidatePath("/novedades");
  revalidatePath("/campus/[university]", "page");
  revalidatePath("/campus/[university]/noticia/[id]", "page");
}
