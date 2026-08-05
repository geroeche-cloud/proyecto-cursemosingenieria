import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { GlobalNet } from "@/components/campus/GlobalNet";
import { CampusCrumb } from "@/components/campus/CampusCrumb";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 60;

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

const KIND_LABEL: Record<string, string> = {
  beca: "Beca",
  pasantia: "Pasantía",
  programa: "Programa",
  evento: "Evento",
  competencia: "Competencia",
  noticia: "Noticia",
};
const MODALITY_LABEL: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  ambas: "Presencial y virtual",
};

function waLink(num: string | null): string | null {
  if (!num) return null;
  const digits = num.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function initials(name: string | null): string {
  if (!name) return "★";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "★"
  );
}

/** Agrupa la trayectoria por año, respetando el orden de aparición. */
function groupTrajectory(items: { year: string; text: string }[]) {
  const groups: { year: string; items: string[] }[] = [];
  for (const t of items) {
    const year = t.year || "—";
    let g = groups.find((x) => x.year === year);
    if (!g) {
      g = { year, items: [] };
      groups.push(g);
    }
    g.items.push(t.text);
  }
  return groups;
}

export async function generateStaticParams() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("universities").select("slug").eq("status", "active");
    return (data ?? []).map((u: { slug: string }) => ({ university: u.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ university: string }>;
}): Promise<Metadata> {
  const { university } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("universities")
    .select("name, short_name")
    .eq("slug", university)
    .maybeSingle();
  return { title: data ? `${data.short_name || data.name} · Campus` : "Campus" };
}

function Head({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="eyebrow flex items-center gap-3">
        <span className="metal-tick" />
        {eyebrow}
      </span>
      <h2 className="font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight text-ink">
        {title}
      </h2>
      {lead && <p className="max-w-2xl leading-relaxed text-ink-soft">{lead}</p>}
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <section className="mt-20 flex flex-col gap-8 sm:mt-24">{children}</section>;
}

type News = { id: string; title: string; summary: string | null; published_at: string | null };
type Opp = {
  id: string; kind: string; title: string; org: string | null;
  description: string | null; deadline: string | null; requirements: string[] | null; href: string | null;
};
type Prof = {
  id: string; name: string; title: string | null; modality: string;
  subjects: string[] | null; whatsapp: string | null;
};
type Drive = { id: string; owner: string; career: string | null; href: string | null };

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ university: string }>;
}) {
  const { university } = await params;
  const supabase = createPublicClient();

  const { data: uni } = await supabase
    .from("universities")
    .select("id, name, short_name, city, slug")
    .eq("slug", university)
    .eq("status", "active")
    .maybeSingle();
  if (!uni) notFound();

  const uid = uni.id;
  const [newsRes, oppRes, profRes, driveRes, ambProfileRes] = await Promise.all([
    supabase.from("news").select("id, title, summary, published_at").eq("university_id", uid).eq("status", "published").order("published_at", { ascending: false }).limit(30),
    supabase.from("opportunities").select("id, kind, title, org, description, deadline, requirements, href").eq("university_id", uid).eq("status", "published").order("created_at", { ascending: false }),
    supabase.from("professors").select("id, name, title, modality, subjects, whatsapp").eq("university_id", uid).eq("status", "published"),
    supabase.from("drives").select("id, owner, career, href").eq("university_id", uid).eq("status", "published"),
    supabase.from("ambassador_profiles").select("display_name, presentation, bio, photo_url, trajectory").eq("university_id", uid).maybeSingle(),
  ]);

  const news = (newsRes.data ?? []) as News[];
  const opportunities = (oppRes.data ?? []) as Opp[];
  const professors = (profRes.data ?? []) as Prof[];
  const drives = (driveRes.data ?? []) as Drive[];

  const ambRaw = ambProfileRes.data as {
    display_name: string | null;
    presentation: string | null;
    bio: string | null;
    photo_url: string | null;
    trajectory: unknown;
  } | null;
  const ambassador =
    ambRaw && (ambRaw.display_name || ambRaw.bio || ambRaw.photo_url)
      ? {
          name: ambRaw.display_name,
          presentation: ambRaw.presentation,
          bio: ambRaw.bio,
          photo: ambRaw.photo_url,
          trajectory: Array.isArray(ambRaw.trajectory)
            ? (ambRaw.trajectory as { year?: unknown; text?: unknown }[])
                .map((t) => ({ year: String(t.year ?? ""), text: String(t.text ?? "") }))
                .filter((t) => t.text)
            : [],
        }
      : null;
  const trajGroups = ambassador ? groupTrajectory(ambassador.trajectory) : [];

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <GlobalNet />

        <div className="shell relative z-10 pt-32 pb-24 sm:pt-40">
          <Reveal>
            <CampusCrumb items={[{ label: "Campus", href: "/campus" }, { label: uni.short_name || uni.name }]} />
          </Reveal>

          <div className="mt-6 flex flex-col gap-3">
            <Reveal delay={0.05}>
              <h1 className="font-display text-[length:var(--text-h1)] font-bold leading-[0.95] tracking-tight text-ink">
                {uni.name}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
                Facultad de Ingeniería{uni.city ? ` · ${uni.city}` : ""}
              </p>
            </Reveal>
          </div>

          {/* Embajador */}
          {ambassador && (
            <section className="mt-16 sm:mt-20">
              <Reveal>
                <div
                  className="chrome-edge overflow-hidden rounded-3xl border border-hair-strong p-6 sm:p-8"
                  style={{ background: CARD }}
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="shrink-0">
                      {ambassador.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ambassador.photo}
                          alt={ambassador.name ?? "Embajador"}
                          className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
                          style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                        />
                      ) : (
                        <div
                          className="flex h-24 w-24 items-center justify-center rounded-2xl font-display text-2xl font-bold text-blue-100 sm:h-28 sm:w-28"
                          style={{
                            background:
                              "linear-gradient(158deg, rgba(59,107,255,0.4), rgba(26,58,168,0.16))",
                            border: "1px solid rgba(120,150,255,0.42)",
                          }}
                        >
                          {initials(ambassador.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="eyebrow flex items-center gap-3">
                        <span className="metal-tick" />
                        Embajador
                      </span>
                      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                        {ambassador.name ?? "Embajador"}
                      </h2>
                      {ambassador.presentation && (
                        <p className="mt-1 font-medium text-ti-500">{ambassador.presentation}</p>
                      )}
                    </div>
                  </div>

                  {ambassador.bio && (
                    <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">{ambassador.bio}</p>
                  )}

                  {trajGroups.length > 0 && (
                    <div className="mt-8 border-t border-hair pt-6">
                      <p className="eyebrow mb-4 flex items-center gap-3">
                        <span className="metal-tick" />
                        Trayectoria
                      </p>
                      <div className="flex flex-col gap-5">
                        {trajGroups.map((g) => (
                          <div key={g.year} className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                            <span className="font-display text-2xl font-bold leading-none text-ti-500 sm:w-24 sm:shrink-0">
                              {g.year}
                            </span>
                            <ul className="flex flex-col gap-1.5">
                              {g.items.map((it, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 leading-snug text-ink-soft"
                                >
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                                  {it}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            </section>
          )}

          {/* Novedades */}
          <Section>
            <Reveal>
              <Head eyebrow="Novedades" title="Noticias y oportunidades" />
            </Reveal>
            <div className="flex flex-col gap-4">
              {news.length === 0 && opportunities.length === 0 && (
                <p className="text-sm text-ink-mute">Todavía no hay publicaciones.</p>
              )}
              {news.map((n) => (
                <Reveal key={n.id}>
                  <article className="chrome-edge rounded-2xl border border-hair-strong p-6" style={{ background: CARD }}>
                    <span className="rounded-full border border-hair px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute">
                      Noticia
                    </span>
                    <h3 className="mt-2 font-display text-xl font-semibold text-ink">{n.title}</h3>
                    {n.summary && <p className="mt-1 leading-relaxed text-ink-soft">{n.summary}</p>}
                  </article>
                </Reveal>
              ))}
              {opportunities.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {opportunities.map((o) => (
                    <Reveal key={o.id}>
                      <article className="chrome-edge flex h-full flex-col gap-4 rounded-3xl border border-hair-strong p-6 lift" style={{ background: CARD }}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-blue-300">
                            {KIND_LABEL[o.kind] ?? o.kind}
                          </span>
                          {o.deadline && (
                            <span className="rounded-full border border-hair px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-mute">
                              {o.deadline}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-semibold leading-snug text-ink">{o.title}</h3>
                          {o.org && <p className="mt-1 text-sm font-medium text-ti-500">{o.org}</p>}
                          {o.description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{o.description}</p>}
                        </div>
                        {o.requirements && o.requirements.length > 0 && (
                          <div className="border-t border-hair pt-4">
                            <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-mute">
                              Requisitos excluyentes
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {o.requirements.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm leading-snug text-ink-soft">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {o.href && (
                          <a href={o.href} target="_blank" rel="noopener noreferrer" className="btn btn-blue mt-auto w-full text-sm">
                            Ver convocatoria
                          </a>
                        )}
                      </article>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Profesores */}
          <Section>
            <Reveal>
              <Head eyebrow="Acompañamiento" title="Alianzas académicas" lead="Profesores particulares, tutorías y mentorías." />
            </Reveal>
            <div className="flex flex-col gap-3">
              {professors.length === 0 ? (
                <p className="text-sm text-ink-mute">Todavía no hay profesores publicados.</p>
              ) : (
                professors.map((p) => {
                  const wa = waLink(p.whatsapp);
                  return (
                    <Reveal key={p.id}>
                      <article className="chrome-edge flex flex-col gap-4 rounded-3xl border border-hair-strong p-6 sm:flex-row sm:items-center sm:justify-between" style={{ background: CARD }}>
                        <div>
                          <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-blue-300">
                            {MODALITY_LABEL[p.modality] ?? p.modality}
                          </span>
                          <h3 className="mt-2 font-display text-xl font-semibold text-ink">{p.name}</h3>
                          {p.title && <p className="text-sm text-ti-500">{p.title}</p>}
                          {p.subjects && p.subjects.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {p.subjects.map((s, i) => (
                                <span key={i} className="rounded-full border border-hair px-2.5 py-0.5 text-xs text-ink-soft">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-blue shrink-0 self-start text-sm sm:self-auto">
                            Escribime
                          </a>
                        )}
                      </article>
                    </Reveal>
                  );
                })
              )}
            </div>
          </Section>

          {/* Drives */}
          <Section>
            <Reveal>
              <Head
                eyebrow="Material colaborativo"
                title="Recursos de estudio"
                lead={`Drives compartidos por estudiantes de la ${uni.name}.`}
              />
            </Reveal>
            <div className="flex flex-col gap-3">
              {drives.length === 0 ? (
                <p className="text-sm text-ink-mute">Todavía no hay drives publicados.</p>
              ) : (
                drives.map((d) => (
                  <Reveal key={d.id}>
                    <div className="chrome-edge flex flex-col gap-4 rounded-2xl border border-hair-strong p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" style={{ background: CARD }}>
                      <div>
                        <h4 className="font-display text-lg font-semibold text-ink">Drive de {d.owner}</h4>
                        {d.career && (
                          <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.12em] text-ti-500">{d.career}</p>
                        )}
                      </div>
                      {d.href && (
                        <a href={d.href} target="_blank" rel="noopener noreferrer" className="btn btn-blue shrink-0 self-start text-sm sm:self-auto">
                          Acceder
                        </a>
                      )}
                    </div>
                  </Reveal>
                ))
              )}
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
