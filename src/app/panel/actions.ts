"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

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

export async function createNews(formData: FormData) {
  await assertAmbassador();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;
  if (!title) return;

  const supabase = await createClient();
  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

  // university_id y author_id los completa SOLO la base (trigger). Nunca el cliente.
  const { error } = await supabase
    .from("news")
    .insert({ title, slug, summary, body, status: "draft" });
  if (error) throw new Error(error.message);

  revalidatePath("/panel");
}

export async function setNewsStatus(formData: FormData) {
  await assertAmbassador();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "published", "archived"].includes(status)) return;

  const supabase = await createClient();
  // RLS garantiza que solo puede tocar noticias de SU universidad.
  const { error } = await supabase
    .from("news")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/panel");
  revalidatePath("/novedades");
}

export async function deleteNews(formData: FormData) {
  await assertAmbassador();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/panel");
  revalidatePath("/novedades");
}
