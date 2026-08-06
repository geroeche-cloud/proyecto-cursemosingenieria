import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Row = { status: "draft" | "published" | "archived" };

type ModuleStat = {
  key: string;
  label: string;
  href: string;
  lead: string;
  published: number;
  drafts: number;
};

function countBy(rows: Row[] | null) {
  const list = rows ?? [];
  return {
    published: list.filter((r) => r.status === "published").length,
    drafts: list.filter((r) => r.status === "draft").length,
  };
}

export default async function PanelHome() {
  const user = await getSessionUser();
  if (!user?.university_id) redirect("/login");

  const supabase = await createClient();

  const [uniRes, newsRes, oppRes, profRes, driveRes] = await Promise.all([
    supabase.from("universities").select("name, slug").eq("id", user.university_id).single(),
    supabase.from("news").select("status"),
    supabase.from("opportunities").select("status"),
    supabase.from("professors").select("status"),
    supabase.from("drives").select("status"),
  ]);

  const slug = uniRes.data?.slug ?? null;

  const modules: ModuleStat[] = [
    {
      key: "noticias",
      label: "Noticias",
      href: "/panel/noticias",
      lead: "Novedades y avisos para tu facultad.",
      ...countBy(newsRes.data as Row[] | null),
    },
    {
      key: "oportunidades",
      label: "Oportunidades",
      href: "/panel/oportunidades",
      lead: "Becas, pasantías, programas y convocatorias.",
      ...countBy(oppRes.data as Row[] | null),
    },
    {
      key: "profesores",
      label: "Profesores",
      href: "/panel/profesores",
      lead: "Tutorías, mentorías y clases particulares.",
      ...countBy(profRes.data as Row[] | null),
    },
    {
      key: "drives",
      label: "Drives",
      href: "/panel/drives",
      lead: "Material de estudio compartido en Google Drive.",
      ...countBy(driveRes.data as Row[] | null),
    },
  ];

  const totalPublished = modules.reduce((n, m) => n + m.published, 0);
  const totalDrafts = modules.reduce((n, m) => n + m.drafts, 0);
  const firstName = user.full_name?.split(" ")[0] ?? "embajador";

  return (
    <div className="flex flex-col gap-10">
      {/* Bienvenida + estado del campus público */}
      <section
        className="rounded-3xl border border-hair-strong p-6 sm:p-8"
        style={{ background: "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)" }}
      >
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-blue-300">
          Hola, {firstName}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Tu campus, en un vistazo
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Cargá contenido como borrador y publicalo cuando quieras. Lo publicado
          aparece al instante en la página pública de tu universidad.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {totalPublished} publicado{totalPublished === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-hair px-3 py-1.5 font-mono text-xs text-ink-mute">
            {totalDrafts} borrador{totalDrafts === 1 ? "" : "es"}
          </span>
          <a
            href="/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost ml-auto text-sm"
          >
            Vista previa (con borradores) ↗
          </a>
          {slug && (
            <a
              href={`/campus/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-blue text-sm"
            >
              Ver mi campus público ↗
            </a>
          )}
        </div>
      </section>

      {/* Módulos */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="metal-tick" />
          <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-mute">
            ¿Qué querés cargar hoy?
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.key}
              href={m.href}
              className="group flex flex-col justify-between gap-5 rounded-2xl border border-hair bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/50"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {m.label}
                  </h3>
                  <span className="font-mono text-xs text-blue-300 opacity-0 transition-opacity group-hover:opacity-100">
                    Gestionar →
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{m.lead}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-emerald-300">
                  {m.published} en vivo
                </span>
                {m.drafts > 0 && (
                  <span className="rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-mute">
                    {m.drafts} borrador{m.drafts === 1 ? "" : "es"}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
