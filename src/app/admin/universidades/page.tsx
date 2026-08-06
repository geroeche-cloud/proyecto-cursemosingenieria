import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";
import { UniversityForm } from "../UniversityForm";
import { UniversitiesList, type UniRow } from "./UniversitiesList";

export default async function AdminUniversidadesPage() {
  const supabase = await createClient();

  const [uniRes, ambRes, newsRes, oppRes, profRes, driveRes] = await Promise.all([
    supabase.from("universities").select("id, name, short_name, city, status").is("deleted_at", null).order("name"),
    supabase.from("profiles").select("full_name, email, university_id").eq("role", "ambassador").is("deleted_at", null),
    supabase.from("news").select("university_id").eq("status", "published"),
    supabase.from("opportunities").select("university_id").eq("status", "published"),
    supabase.from("professors").select("university_id").eq("status", "published"),
    supabase.from("drives").select("university_id").eq("status", "published"),
  ]);
  logIfError("admin universidades", uniRes.error);

  const ambPorUni = new Map(
    ((ambRes.data ?? []) as { full_name: string | null; email: string | null; university_id: string | null }[])
      .filter((a) => a.university_id)
      .map((a) => [a.university_id as string, a.full_name || a.email || "embajador"]),
  );

  const conteo = new Map<string, number>();
  for (const res of [newsRes, oppRes, profRes, driveRes]) {
    for (const r of (res.data ?? []) as { university_id: string }[]) {
      conteo.set(r.university_id, (conteo.get(r.university_id) ?? 0) + 1);
    }
  }

  const universities: UniRow[] = (
    (uniRes.data ?? []) as { id: string; name: string; short_name: string | null; city: string | null; status: string }[]
  ).map((u) => ({
    ...u,
    embajador: ambPorUni.get(u.id) ?? null,
    publicaciones: conteo.get(u.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-xl font-semibold">Universidades</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cada universidad activa aparece en el campus público y puede tener un embajador.
        </p>
        <div className="mt-4">
          <UniversitiesList universities={universities} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Sumar una universidad</h2>
        <UniversityForm />
      </section>
    </div>
  );
}
