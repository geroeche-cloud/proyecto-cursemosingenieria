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
  const starts_at = String(formData.get("starts_at") ?? "").trim() || null;
  const ends_at = String(formData.get("ends_at") ?? "").trim() || null;
  const publish = String(formData.get("intent") ?? "") === "publish";
  if (!title) return;

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
  if (error) throw new Error(error.message);

  revalidatePath("/panel/noticias");
  if (publish) {
    revalidatePath("/novedades");
    revalidatePath("/campus/[university]", "page");
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
  if (error) throw new Error(error.message);

  revalidatePath("/panel/noticias");
  revalidatePath("/novedades");
  revalidatePath("/campus/[university]", "page");
}

export async function deleteNews(formData: FormData) {
  await assertAmbassador();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/panel/noticias");
  revalidatePath("/novedades");
  revalidatePath("/campus/[university]", "page");
}
