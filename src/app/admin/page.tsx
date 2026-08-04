import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createUniversity, createAmbassador } from "./actions";

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

const field =
  "rounded-lg border border-hair-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-blue-500";

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

        <form action={createUniversity} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-ink-soft">Nombre</span>
            <input name="name" required placeholder="Universidad Nacional del Comahue" className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">Sigla</span>
            <input name="short_name" placeholder="UNCo" className={`${field} w-28`} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">Ciudad</span>
            <input name="city" placeholder="Neuquén" className={`${field} w-36`} />
          </label>
          <button type="submit" className="btn btn-blue text-sm">
            Crear universidad
          </button>
        </form>
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
                  <span className="text-sm text-ink">
                    {a.full_name || a.email}
                    {a.full_name ? <span className="text-ink-mute"> · {a.email}</span> : null}
                  </span>
                  <span className="font-mono text-xs text-blue-300">
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
          <form action={createAmbassador} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Nombre completo</span>
              <input name="full_name" placeholder="Gerónimo Echevarría" className={field} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Universidad</span>
              <select name="university_id" required className={field} defaultValue="">
                <option value="" disabled>
                  Elegí una universidad
                </option>
                {unis.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Email</span>
              <input name="email" type="email" required placeholder="embajador@email.com" className={field} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Contraseña temporal</span>
              <input name="password" type="text" required minLength={8} placeholder="mínimo 8 caracteres" className={field} />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="btn btn-blue text-sm">
                Crear embajador
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
