import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UniversityForm } from "./UniversityForm";
import { AmbassadorForm } from "./AmbassadorForm";
import { AmbassadorProfileEditor, type ProfileRow } from "./AmbassadorProfileEditor";
import { DangerForm } from "./DangerForm";
import {
  setUniversityStatus,
  setAmbassadorStatus,
  unpublishContent,
  deleteUniversity,
  deleteAmbassador,
  deleteContent,
} from "./actions";

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
  status: string;
};

type ModItem = {
  table: "news" | "opportunities" | "professors" | "drives";
  typeLabel: string;
  id: string;
  university_id: string;
  label: string;
  when: string | null;
};

const TABLE_LABEL: Record<ModItem["table"], string> = {
  news: "Noticia",
  opportunities: "Oportunidad",
  professors: "Profesor",
  drives: "Drive",
};

async function publishedCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: ModItem["table"],
) {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  return count ?? 0;
}

export default async function AdminPage() {
  const user = await getSessionUser();
  const supabase = await createClient();

  const [
    uniRes,
    ambRes,
    nCount,
    oCount,
    pCount,
    dCount,
    nRecent,
    oRecent,
    pRecent,
    dRecent,
    profRowsRes,
  ] = await Promise.all([
    supabase
      .from("universities")
      .select("id, name, short_name, city, status")
      .order("name"),
    supabase
      .from("profiles")
      .select("id, email, full_name, university_id, status")
      .eq("role", "ambassador")
      .order("email"),
    publishedCount(supabase, "news"),
    publishedCount(supabase, "opportunities"),
    publishedCount(supabase, "professors"),
    publishedCount(supabase, "drives"),
    supabase
      .from("news")
      .select("id, title, university_id, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    supabase
      .from("opportunities")
      .select("id, title, university_id, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    supabase
      .from("professors")
      .select("id, name, university_id, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("drives")
      .select("id, owner, university_id, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("ambassador_profiles")
      .select(
        "university_id, display_name, presentation, bio, bio_full, photo_url, email, instagram, tiktok, youtube, linkedin, trajectory",
      ),
  ]);

  const unis = (uniRes.data ?? []) as University[];
  const ambs = (ambRes.data ?? []) as Ambassador[];
  const uniName = new Map(unis.map((u) => [u.id, u.short_name || u.name]));
  const uniFullName = new Map(unis.map((u) => [u.id, u.name]));

  // Perfiles públicos de embajadores (uno por universidad con embajador).
  const profByUni = new Map(
    (profRowsRes.data ?? []).map((r) => [r.university_id as string, r]),
  );
  const editorProfiles: ProfileRow[] = ambs
    .filter((a) => a.university_id)
    .map((a) => {
      const row = profByUni.get(a.university_id as string) as
        | {
            display_name: string | null;
            presentation: string | null;
            bio: string | null;
            bio_full: string | null;
            photo_url: string | null;
            email: string | null;
            instagram: string | null;
            tiktok: string | null;
            youtube: string | null;
            linkedin: string | null;
            trajectory: unknown;
          }
        | undefined;
      const traj = Array.isArray(row?.trajectory)
        ? (row!.trajectory as { year?: unknown; title?: unknown; text?: unknown; detail?: unknown }[]).map(
            (t) => ({
              year: String(t.year ?? ""),
              title: String(t.title ?? t.text ?? ""),
              detail: String(t.detail ?? ""),
            }),
          )
        : [];
      return {
        university_id: a.university_id as string,
        university_name: uniFullName.get(a.university_id as string) ?? "—",
        ambassador_name: a.full_name,
        display_name: row?.display_name ?? null,
        presentation: row?.presentation ?? null,
        bio: row?.bio ?? null,
        bio_full: row?.bio_full ?? null,
        photo_url: row?.photo_url ?? null,
        email: row?.email ?? null,
        instagram: row?.instagram ?? null,
        tiktok: row?.tiktok ?? null,
        youtube: row?.youtube ?? null,
        linkedin: row?.linkedin ?? null,
        trajectory: traj,
      };
    });

  const activeUnis = unis.filter((u) => u.status === "active").length;
  const activeAmbs = ambs.filter((a) => a.status === "active").length;
  const suspendedAmbs = ambs.length - activeAmbs;
  const totalPublished = nCount + oCount + pCount + dCount;

  // Feed de moderación: contenido publicado de todas las universidades.
  const moderation: ModItem[] = [
    ...(nRecent.data ?? []).map((r) => ({
      table: "news" as const,
      typeLabel: TABLE_LABEL.news,
      id: r.id as string,
      university_id: r.university_id as string,
      label: r.title as string,
      when: (r.published_at as string | null) ?? null,
    })),
    ...(oRecent.data ?? []).map((r) => ({
      table: "opportunities" as const,
      typeLabel: TABLE_LABEL.opportunities,
      id: r.id as string,
      university_id: r.university_id as string,
      label: r.title as string,
      when: (r.published_at as string | null) ?? null,
    })),
    ...(pRecent.data ?? []).map((r) => ({
      table: "professors" as const,
      typeLabel: TABLE_LABEL.professors,
      id: r.id as string,
      university_id: r.university_id as string,
      label: r.name as string,
      when: (r.created_at as string | null) ?? null,
    })),
    ...(dRecent.data ?? []).map((r) => ({
      table: "drives" as const,
      typeLabel: TABLE_LABEL.drives,
      id: r.id as string,
      university_id: r.university_id as string,
      label: `Drive de ${r.owner as string}`,
      when: (r.created_at as string | null) ?? null,
    })),
  ]
    .sort((a, b) => (b.when ?? "").localeCompare(a.when ?? ""))
    .slice(0, 12);

  const stats = [
    { label: "Universidades activas", value: activeUnis, sub: `${unis.length} en total` },
    { label: "Embajadores activos", value: activeAmbs, sub: `${suspendedAmbs} suspendido${suspendedAmbs === 1 ? "" : "s"}` },
    { label: "Publicaciones en vivo", value: totalPublished, sub: "en todo el país" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
            Administración
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Panel de Cursemos Ingeniería
          </h1>
          <p className="mt-1 text-sm text-ink-soft break-anywhere">{user?.email}</p>
        </div>
        <form action="/auth/signout" method="post" className="sm:shrink-0">
          <button type="submit" className="btn btn-ghost text-sm">
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* ---------- Resumen ---------- */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-hair-strong p-5"
            style={{ background: "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)" }}
          >
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-mute">
              {s.label}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* ---------- Universidades ---------- */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">Universidades</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-hair">
          {unis.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-mute">Todavía no hay universidades.</p>
          ) : (
            <ul className="divide-y divide-hair">
              {unis.map((u) => {
                const active = u.status === "active";
                return (
                  <li
                    key={u.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-ink break-anywhere">
                        {u.name}
                        {u.short_name ? <span className="text-ink-mute"> · {u.short_name}</span> : null}
                      </p>
                      <p className="font-mono text-xs text-ink-mute">{u.city}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
                      <span
                        className={
                          active
                            ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300"
                            : "rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute"
                        }
                      >
                        {active ? "Activa" : "Inactiva"}
                      </span>
                      <form action={setUniversityStatus}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="status" value={active ? "inactive" : "active"} />
                        <button type="submit" className="btn btn-ghost text-xs">
                          {active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                      <DangerForm
                        action={deleteUniversity}
                        hidden={{ id: u.id }}
                        confirm={`¿Borrar "${u.name}"? Se eliminan también todas sus publicaciones y el perfil de su embajador. Esta acción no se puede deshacer.`}
                        label="Borrar"
                        className="btn btn-ghost text-xs text-red-300"
                      />
                    </div>
                  </li>
                );
              })}
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
              {ambs.map((a) => {
                const active = a.status === "active";
                return (
                  <li
                    key={a.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink break-anywhere">{a.full_name || "Sin nombre"}</p>
                      <p className="font-mono text-xs text-ink-mute break-anywhere">{a.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
                      <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-blue-300">
                        {a.university_id ? uniName.get(a.university_id) ?? "—" : "sin asignar"}
                      </span>
                      {!active && (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-amber-300">
                          Suspendido
                        </span>
                      )}
                      <form action={setAmbassadorStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value={active ? "suspended" : "active"} />
                        <button
                          type="submit"
                          className={active ? "btn btn-ghost text-xs text-amber-300" : "btn btn-ghost text-xs text-emerald-300"}
                        >
                          {active ? "Suspender" : "Reactivar"}
                        </button>
                      </form>
                      <DangerForm
                        action={deleteAmbassador}
                        hidden={{ id: a.id }}
                        confirm={`¿Borrar la cuenta de ${a.full_name || a.email || "este embajador"}? No podrá volver a ingresar. Esta acción no se puede deshacer.`}
                        label="Borrar"
                        className="btn btn-ghost text-xs text-red-300"
                      />
                    </div>
                  </li>
                );
              })}
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

      {/* ---------- Perfil público del embajador ---------- */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">Perfil público del embajador</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Foto, presentación, bio y trayectoria que se muestran en la página pública
          de cada universidad.
        </p>
        <AmbassadorProfileEditor profiles={editorProfiles} />
      </section>

      {/* ---------- Moderación ---------- */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">Contenido publicado</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Todo lo que está en vivo en el país. Podés bajar cualquier publicación.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-hair">
          {moderation.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-mute">Todavía no hay contenido publicado.</p>
          ) : (
            <ul className="divide-y divide-hair">
              {moderation.map((m) => (
                <li
                  key={`${m.table}-${m.id}`}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink break-anywhere">{m.label}</p>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-mute">
                      {m.typeLabel} · {uniName.get(m.university_id) ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <form action={unpublishContent}>
                      <input type="hidden" name="table" value={m.table} />
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="btn btn-ghost text-xs text-amber-300">
                        Despublicar
                      </button>
                    </form>
                    <DangerForm
                      action={deleteContent}
                      hidden={{ table: m.table, id: m.id }}
                      confirm="¿Borrar esta publicación definitivamente? Esta acción no se puede deshacer."
                      label="Borrar"
                      className="btn btn-ghost text-xs text-red-300"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
