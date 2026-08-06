import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NoticiaForm, type NoticiaInitial } from "../NoticiaForm";

export default async function EditNoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("id, title, summary, body, starts_at, ends_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/noticias" className="font-mono text-xs text-blue-300 hover:text-blue-200">
        ← Volver a noticias
      </Link>
      <h2 className="font-display text-xl font-semibold">Editar noticia</h2>
      <NoticiaForm initial={data as NoticiaInitial} />
    </div>
  );
}
