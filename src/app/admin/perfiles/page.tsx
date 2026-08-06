import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";
import { AmbassadorProfileEditor, type ProfileRow } from "../AmbassadorProfileEditor";

export default async function AdminPerfilesPage() {
  const supabase = await createClient();

  const [uniRes, ambRes, profRes] = await Promise.all([
    supabase.from("universities").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name, university_id").eq("role", "ambassador"),
    supabase
      .from("ambassador_profiles")
      .select(
        "university_id, display_name, presentation, bio, bio_full, photo_url, email, instagram, tiktok, youtube, linkedin, trajectory",
      ),
  ]);
  logIfError("admin perfiles", profRes.error);

  const uniFullName = new Map(
    ((uniRes.data ?? []) as { id: string; name: string }[]).map((u) => [u.id, u.name]),
  );
  const profByUni = new Map(
    ((profRes.data ?? []) as { university_id: string }[]).map((r) => [r.university_id, r]),
  );

  const profiles: ProfileRow[] = (
    (ambRes.data ?? []) as { full_name: string | null; university_id: string | null }[]
  )
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

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Perfil público del embajador</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Foto, presentación, bio y trayectoria que se muestran en la portada y en la página
        de cada universidad.
      </p>
      <AmbassadorProfileEditor profiles={profiles} />
    </div>
  );
}
