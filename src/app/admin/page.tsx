import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UniversityForm } from "./UniversityForm";
import { AmbassadorForm } from "./AmbassadorForm";

type University = {
  id: string;
  name: string;
  short_name: string | null;
  city: string | null;
  status: string;
};

type Ambassador = {
  id: string;
  email: string | null;
  full_name: string | null;
  university_id: string | null;
};

export default async function AdminPage() {
  const user = await getSessionUser();
  const supabase = await createClient();

  const { data: universities } = await supabase
    .from("universities")
    .select("id, name, short_name, city, status")
    .order("name");
  const { data: ambassadors } = await supabase
    .from("profiles")
    .select("id, email, full_name, university_id")
    .eq("role", "ambassador")
    .order("email");

  const unis = (universities ?? []) as University[];
  const ambs = (ambassadors ?? []) as Ambassador[];
  const uniName = new Map(unis.map((u) => [u.id, u.short_name || u.name]));

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
            Administración
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            Panel de Cursemos Ingeniería
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{user?.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-ghost text-sm">
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* ---------- Universidades ---------- */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Universidades</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-hair">
          {unis.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-mute">Todavía no hay universidades.</p>
          ) : (
            <ul className="divide-y divide-hair">
              {unis.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <span className="text-sm text-ink">
                    {u.name}
                    {u.short_name ? <span className="text-ink-mute"> · {u.short_name}</span> : null}
                  </span>
                  <span className="font-mono text-xs text-ink-mute">{u.city}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <UniversityForm />
      </section>

      {/* ---------- Embajadores ---------- */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">Embajadores</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-hair">
          {ambs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-mute">Todavía no hay embajadores.</p>
          ) : (
            <ul className="divide-y divide-hair">
              {ambs.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{a.full_name || "Sin nombre"}</p>
                    <p className="truncate font-mono text-xs text-ink-mute">{a.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-blue-300">
                    {a.university_id ? uniName.get(a.university_id) ?? "—" : "sin asignar"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

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
