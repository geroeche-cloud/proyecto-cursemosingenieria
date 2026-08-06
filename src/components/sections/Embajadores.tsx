import { Reveal } from "@/components/ui/Reveal";
import { AmbientLights } from "@/components/ui/AmbientLights";
import { AmbassadorCard, type AmbassadorCardData } from "@/components/campus/AmbassadorCard";
import { createPublicClient } from "@/lib/supabase/public";
import { logIfError } from "@/lib/log";

type ProfileRow = {
  university_id: string;
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
};

function toTrajectory(raw: unknown) {
  return Array.isArray(raw)
    ? (raw as { year?: unknown; title?: unknown; text?: unknown; detail?: unknown }[])
        .map((t) => ({
          year: String(t.year ?? ""),
          title: String(t.title ?? t.text ?? ""),
          detail: String(t.detail ?? ""),
        }))
        .filter((t) => t.title)
    : [];
}

async function loadAmbassadors(): Promise<AmbassadorCardData[]> {
  try {
    const supabase = createPublicClient();
    const [profRes, uniRes] = await Promise.all([
      supabase
        .from("ambassador_profiles")
        .select(
          "university_id, display_name, presentation, bio, bio_full, photo_url, email, instagram, tiktok, youtube, linkedin, trajectory",
        ),
      supabase.from("universities").select("id, name").eq("status", "active"),
    ]);

    logIfError("home ambassador_profiles", profRes.error);
    logIfError("home universities", uniRes.error);

    const uniName = new Map((uniRes.data ?? []).map((u) => [u.id as string, u.name as string]));
    return ((profRes.data ?? []) as ProfileRow[])
      .filter((p) => uniName.has(p.university_id) && (p.display_name || p.bio || p.photo_url))
      .map((p) => ({
        universityId: p.university_id,
        universityName: uniName.get(p.university_id) ?? "",
        name: p.display_name,
        presentation: p.presentation,
        bio: p.bio,
        bioFull: p.bio_full,
        photo: p.photo_url,
        email: p.email,
        instagram: p.instagram,
        tiktok: p.tiktok,
        youtube: p.youtube,
        linkedin: p.linkedin,
        trajectory: toTrajectory(p.trajectory),
      }));
  } catch {
    return [];
  }
}

/**
 * "Conocé a los embajadores" — se alimenta de la base: cada embajador con perfil
 * cargado aparece con la misma tarjeta que en la página de su universidad.
 */
export async function Embajadores() {
  const ambassadors = await loadAmbassadors();
  const placeholders = Math.max(0, 3 - ambassadors.length);

  return (
    <section id="embajadores" className="relative overflow-hidden py-24 sm:py-32">
      <AmbientLights variant="blue" />
      <div className="shell relative z-10">
        <Reveal>
          <h2 className="flex items-center gap-4 font-display text-[length:var(--text-h3)] font-semibold tracking-tight text-ink">
            <span className="metal-tick" />
            Conocé a los embajadores
          </h2>
        </Reveal>

        {ambassadors.length > 0 ? (
          <div className="mt-12 flex flex-col gap-16">
            {ambassadors.map((a, i) => (
              <Reveal key={`${a.universityName}-${i}`}>
                <AmbassadorCard data={a} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-10 max-w-2xl leading-relaxed text-ink-soft">
            Pronto vas a conocer a los estudiantes que representan a Cursemos Ingeniería
            en cada universidad.
          </p>
        )}

        {/* Expansión a otras universidades */}
        {placeholders > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-16 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: placeholders }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-hair-strong p-7 text-center"
                  style={{ borderStyle: "dashed" }}
                >
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-mute">
                    Universidad
                  </span>
                  <p className="font-display text-sm font-medium text-ink-faint">
                    Próximo embajador
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
