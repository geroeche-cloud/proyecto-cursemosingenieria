import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OpportunityForm, type OpportunityInitial } from "../OpportunityForm";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunities")
    .select("id, kind, title, org, description, deadline, href, requirements, starts_at, ends_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/oportunidades" className="font-mono text-xs text-blue-300 hover:text-blue-200">
        ← Volver a oportunidades
      </Link>
      <h2 className="font-display text-xl font-semibold">Editar oportunidad</h2>
      <OpportunityForm initial={data as OpportunityInitial} />
    </div>
  );
}
