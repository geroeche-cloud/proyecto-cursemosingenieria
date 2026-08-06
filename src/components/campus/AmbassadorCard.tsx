import Image from "next/image";
import { AmbassadorMore } from "./AmbassadorMore";

export type AmbassadorCardData = {
  universityName: string;
  name: string | null;
  presentation: string | null;
  bio: string | null;
  bioFull: string | null;
  photo: string | null;
  email: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  linkedin: string | null;
  trajectory: { year: string; title: string; detail: string }[];
};

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

/** Antepone https:// si el admin pegó una URL sin esquema. */
function normalizeUrl(url: string): string {
  const u = url.trim();
  if (/^https?:\/\//i.test(u) || u.startsWith("mailto:")) return u;
  return `https://${u}`;
}

/** Agrupa la trayectoria por año, respetando el orden de aparición. */
function groupTrajectory(items: { year: string; title: string; detail: string }[]) {
  const groups: { year: string; items: { title: string; detail: string }[] }[] = [];
  for (const t of items) {
    const year = t.year || "—";
    let g = groups.find((x) => x.year === year);
    if (!g) {
      g = { year, items: [] };
      groups.push(g);
    }
    g.items.push({ title: t.title, detail: t.detail });
  }
  return groups;
}

/**
 * Tarjeta única del embajador (foto grande + info + redes + despliegue de la
 * trayectoria completa). Se usa igual en la home ("Conocé a los embajadores")
 * y en la página pública de cada universidad.
 */
export function AmbassadorCard({ data }: { data: AmbassadorCardData }) {
  const name = data.name ?? "Embajador";
  const socials = [
    data.email ? { label: "Mail", href: `mailto:${data.email}` } : null,
    data.instagram ? { label: "Instagram", href: normalizeUrl(data.instagram) } : null,
    data.tiktok ? { label: "TikTok", href: normalizeUrl(data.tiktok) } : null,
    data.youtube ? { label: "YouTube", href: normalizeUrl(data.youtube) } : null,
    data.linkedin ? { label: "LinkedIn", href: normalizeUrl(data.linkedin) } : null,
  ].filter((s): s is { label: string; href: string } => s !== null);
  const groups = groupTrajectory(data.trajectory);

  return (
    <article className="grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-12">
      {/* Fotografía */}
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-3xl border border-hair-strong chrome-edge lg:mx-0">
        {data.photo ? (
          <Image
            src={data.photo}
            alt={name}
            fill
            sizes="(max-width: 1024px) 90vw, 320px"
            className="object-cover object-[50%_18%]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-blue-100"
            style={{
              background: "linear-gradient(158deg, rgba(59,107,255,0.4), rgba(26,58,168,0.16))",
            }}
          >
            {initials(data.name)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg/60 to-transparent" />
      </div>

      {/* Información */}
      <div className="flex flex-col gap-5">
        <div>
          <span className="eyebrow flex items-center gap-3">
            <span className="metal-tick" />
            {data.universityName}
          </span>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {name}
          </h3>
          {data.presentation && (
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-ink-mute">
              {data.presentation}
            </p>
          )}
        </div>

        {data.bio && <p className="max-w-2xl leading-relaxed text-ink-soft">{data.bio}</p>}

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {socials.map((s) => {
              const external = !s.href.startsWith("mailto:");
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="chip rounded-full px-3.5 py-1.5 text-sm font-medium text-ti-100 transition-colors hover:text-white"
                >
                  {s.label}
                </a>
              );
            })}
          </div>
        )}

        <AmbassadorMore name={name} bioFull={data.bioFull} groups={groups} />
      </div>
    </article>
  );
}
