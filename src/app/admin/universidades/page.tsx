import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";
import { getAdminResumen } from "@/lib/resumenes";
import { UniversityForm } from "../UniversityForm";
import { UniversitiesList, type UniRow } from "./UniversitiesList";

export default async function AdminUniversidadesPage() {
  const supabase = await createClient();

  // El conteo de publicaciones por universidad ya viene calculado por la base
  // (admin_overview). Antes esta pantalla se traía el university_id de TODAS
  // las publicaciones del país para contarlas acá, una por una.
  const [uniRes, ambRes, resumen] = await Promise.all([
    // Mismo orden que el campus público: así esta lista se lee como la grilla
    // que ve un visitante, y "está primera acá" significa "está primera allá".
    supabase
      .from("universities")
      .select("id, name, short_name, city, status, orden")
      .is("deleted_at", null)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("full_name, email, university_id").eq("role", "ambassador").is("deleted_at", null),
    getAdminResumen(),
  ]);
  logIfError("admin universidades", uniRes.error);

  const ambPorUni = new Map(
    ((ambRes.data ?? []) as { full_name: string | null; email: string | null; university_id: string | null }[])
      .filter((a) => a.university_id)
      .map((a) => [a.university_id as string, a.full_name || a.email || "embajador"]),
  );

  const conteo = new Map(resumen.por_universidad.map((u) => [u.id, u.publicaciones]));

  const universities: UniRow[] = (
    (uniRes.data ?? []) as {
      id: string;
      name: string;
      short_name: string | null;
      city: string | null;
      status: string;
      orden: number | null;
    }[]
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
          Cada universidad activa aparece en el campus público y puede tener un embajador. Se
          muestran en este mismo orden: primero las destacadas, después las demás según cuándo se
          sumaron.
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
