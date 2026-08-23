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

/**
 * Cuántos embajadores muestra la PORTADA.
 *
 * Esta sección es una vitrina, no el directorio: el directorio completo es
 * /campus, y desde acá se enlaza. Sin tope, la portada —la página más visitada
 * del sitio— se traía TODOS los perfiles con biografía larga y trayectoria
 * completa. Con una universidad no se nota; con quinientas, cada visitante
 * descarga quinientas biografías para ver seis tarjetas.
 */
const EN_PORTADA = 6;

async function loadAmbassadors(): Promise<AmbassadorCardData[]> {
  try {
    const supabase = createPublicClient();

    // SE EMPIEZA POR LAS UNIVERSIDADES, no por los perfiles. Es al revés de lo
    // que parece natural, y el motivo importa:
    //
    // Antes se pedían 24 perfiles y recién después se miraba de qué universidad
    // eran. Con dos o tres universidades no se nota, pero con quinientos
    // embajadores esos 24 son arbitrarios: la universidad que debía encabezar
    // podía no estar entre ellos, y la vitrina la dejaba afuera.
    //
    // Pidiendo primero las universidades EN SU ORDEN, lo que aparece en la
    // portada es siempre lo que corresponde, sin importar cuánto crezca.
    const uniRes = await supabase
      .from("universities")
      .select("id, name")
      .eq("status", "active")
      // Mismo criterio que /campus: orden elegido, y a igualdad la más antigua
      // primero. `created_at` es inmutable, así que editar un perfil no
      // reordena la portada.
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(EN_PORTADA * 4);
    logIfError("home universities", uniRes.error);

    const universidades = (uniRes.data ?? []) as { id: string; name: string }[];
    if (universidades.length === 0) return [];

    // El orden en que vinieron ES el orden de la vitrina.
    const posicion = new Map(universidades.map((u, i) => [u.id, i]));
    const uniName = new Map(universidades.map((u) => [u.id, u.name]));

    const profRes = await supabase
      .from("ambassador_profiles")
      .select(
        "university_id, display_name, presentation, bio, bio_full, photo_url, email, instagram, tiktok, youtube, linkedin, trajectory",
      )
      .in("university_id", universidades.map((u) => u.id));
    logIfError("home ambassador_profiles", profRes.error);

    const perfiles = (profRes.data ?? []) as ProfileRow[];
    if (perfiles.length === 0) return [];

    return perfiles
      .filter((p) => uniName.has(p.university_id) && (p.display_name || p.bio || p.photo_url))
      .sort((a, b) => (posicion.get(a.university_id) ?? 999) - (posicion.get(b.university_id) ?? 999))
      .slice(0, EN_PORTADA)
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
