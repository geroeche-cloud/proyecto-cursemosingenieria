import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfessorForm, type ProfessorInitial } from "../ProfessorForm";

export default async function EditProfessorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("professors")
    .select("id, name, title, modality, whatsapp, subjects")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/profesores" className="font-mono text-xs text-blue-300 hover:text-blue-200">
        ← Volver a profesores
      </Link>
      <h2 className="font-display text-xl font-semibold">Editar profesor</h2>
      <ProfessorForm initial={data as ProfessorInitial} />
    </div>
  );
}
