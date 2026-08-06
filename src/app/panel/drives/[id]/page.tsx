import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DriveForm, type DriveInitial } from "../DriveForm";

export default async function EditDrivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("drives")
    .select("id, owner, career, href")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/drives" className="font-mono text-xs text-blue-300 hover:text-blue-200">
        ← Volver a drives
      </Link>
      <h2 className="font-display text-xl font-semibold">Editar drive</h2>
      <DriveForm initial={data as DriveInitial} />
    </div>
  );
}
