import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";
import { getAdminResumen } from "@/lib/resumenes";
import { AmbassadorForm } from "../AmbassadorForm";
import { AmbassadorsList, type AmbRow } from "./AmbassadorsList";

export default async function AdminEmbajadoresPage() {
  const supabase = await createClient();

  // Igual que en Universidades: el conteo por universidad lo calcula la base,
  // en vez de traerse el university_id de cada publicación del país.
  const [uniRes, ambRes, resumen] = await Promise.all([
    supabase.from("universities").select("id, name, short_name").is("deleted_at", null).order("name"),
    supabase
      .from("profiles")
      .select("id, email, full_name, university_id, status")
      .eq("role", "ambassador")
      .is("deleted_at", null)
      .order("email"),
    getAdminResumen(),
  ]);
  logIfError("admin embajadores", ambRes.error);

  const unis = (uniRes.data ?? []) as { id: string; name: string; short_name: string | null }[];
  const uniName = new Map(unis.map((u) => [u.id, u.short_name || u.name]));

  const conteo = new Map(resumen.por_universidad.map((u) => [u.id, u.publicaciones]));

  const ambassadors: AmbRow[] = (
    (ambRes.data ?? []) as {
      id: string;
      email: string | null;
      full_name: string | null;
      university_id: string | null;
      status: string;
    }[]
  ).map((a) => ({
    id: a.id,
    email: a.email,
    full_name: a.full_name,
    status: a.status,
    universidad: a.university_id ? uniName.get(a.university_id) ?? "—" : null,
    publicaciones: a.university_id ? conteo.get(a.university_id) ?? 0 : 0,
  }));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-xl font-semibold">Embajadores</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cada embajador administra el contenido de su universidad. Un suspendido no puede ingresar.
        </p>
        <div className="mt-4">
          <AmbassadorsList ambassadors={ambassadors} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Crear un embajador</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Se le crea la cuenta con una contraseña temporal: pasale el enlace de acceso
          (<span className="font-mono text-ink">/login</span>) y podrá cambiarla desde “Cuenta”.
        </p>
        {unis.length === 0 ? (
          <p className="mt-4 text-sm text-ink-mute">
            Creá primero una universidad para poder asignar un embajador.
          </p>
        ) : (
          <AmbassadorForm universities={unis.map((u) => ({ id: u.id, name: u.name }))} />
        )}
      </section>
    </div>
  );
}
