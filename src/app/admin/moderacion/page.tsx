import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";
import { ModerationList, type ModRow } from "./ModerationList";

export default async function AdminModeracionPage() {
  const supabase = await createClient();

  const [uniRes, newsRes, oppRes, profRes, driveRes] = await Promise.all([
    supabase.from("universities").select("id, name, short_name"),
    supabase.from("news").select("id, title, university_id, clicks").eq("status", "published").order("published_at", { ascending: false }).limit(200),
    supabase.from("opportunities").select("id, title, university_id, clicks").eq("status", "published").order("created_at", { ascending: false }).limit(200),
    supabase.from("professors").select("id, name, university_id, clicks").eq("status", "published").order("created_at", { ascending: false }).limit(200),
    supabase.from("drives").select("id, owner, university_id, clicks").eq("status", "published").order("created_at", { ascending: false }).limit(200),
  ]);
  logIfError("admin moderacion", newsRes.error);

  const uniName = new Map(
    ((uniRes.data ?? []) as { id: string; name: string; short_name: string | null }[]).map((u) => [
      u.id,
      u.short_name || u.name,
    ]),
  );
  const nombre = (id: string) => uniName.get(id) ?? "—";

  const items: ModRow[] = [
    ...((newsRes.data ?? []) as { id: string; title: string; university_id: string; clicks: number | null }[]).map((r) => ({
      tabla: "news" as const, tipo: "Noticia", id: r.id, label: r.title,
      universidad: nombre(r.university_id), clicks: r.clicks ?? 0,
    })),
    ...((oppRes.data ?? []) as { id: string; title: string; university_id: string; clicks: number | null }[]).map((r) => ({
      tabla: "opportunities" as const, tipo: "Oportunidad", id: r.id, label: r.title,
      universidad: nombre(r.university_id), clicks: r.clicks ?? 0,
    })),
    ...((profRes.data ?? []) as { id: string; name: string; university_id: string; clicks: number | null }[]).map((r) => ({
      tabla: "professors" as const, tipo: "Profesor", id: r.id, label: r.name,
      universidad: nombre(r.university_id), clicks: r.clicks ?? 0,
    })),
    ...((driveRes.data ?? []) as { id: string; owner: string; university_id: string; clicks: number | null }[]).map((r) => ({
      tabla: "drives" as const, tipo: "Drive", id: r.id, label: `Drive de ${r.owner}`,
      universidad: nombre(r.university_id), clicks: r.clicks ?? 0,
    })),
  ].sort((a, b) => b.clicks - a.clicks);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Contenido publicado</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Todo lo que está en vivo en el país, ordenado por clics. Podés bajar una publicación
        (queda archivada) o borrarla definitivamente.
      </p>
      <div className="mt-4">
        <ModerationList items={items} />
      </div>
    </div>
  );
}
