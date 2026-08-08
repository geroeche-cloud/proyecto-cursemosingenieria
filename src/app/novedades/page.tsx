import { createPublicClient } from "@/lib/supabase/public";
import { isActiveNow, fechaLarga } from "@/lib/schedule";
import { unwrapOrThrow } from "@/lib/log";

// ISR: la página se sirve cacheada y se regenera (acá o al publicar una noticia).
export const revalidate = 60;

type UniRef = { name: string; short_name: string | null };
type Row = {
  id: string;
  title: string;
  summary: string | null;
  published_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  universities: UniRef | UniRef[] | null;
};

function uniOf(row: Row): UniRef | null {
  const u = row.universities;
  return Array.isArray(u) ? (u[0] ?? null) : u;
}

export default async function NovedadesPage() {
  const supabase = createPublicClient();

  // Si la consulta falla no se cachea una página vacía: Next conserva la
  // última versión buena. Cero noticias legítimas sí es un estado válido.
  const data = unwrapOrThrow(
    "novedades",
    await supabase
      .from("news")
      .select("id, title, summary, published_at, starts_at, ends_at, universities(name, short_name)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50),
    [],
  );

  const news = ((data ?? []) as Row[]).filter((n) => isActiveNow(n.starts_at, n.ends_at));

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-ink">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">Novedades</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
        Noticias de la red
      </h1>
      <p className="mt-2 text-ink-soft">
        Lo último publicado por las universidades de Cursemos Ingeniería.
      </p>

      <div className="mt-12 flex flex-col gap-6">
        {news.length === 0 ? (
          <p className="text-sm text-ink-mute">Todavía no hay noticias publicadas.</p>
        ) : (
          news.map((n) => {
            const uni = uniOf(n);
            return (
              <article key={n.id} className="border-b border-hair pb-6">
                {uni && (
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-blue-300">
                    {uni.short_name || uni.name}
                  </p>
                )}
                <h2 className="mt-1.5 font-display text-2xl font-semibold leading-snug">
                  {n.title}
                </h2>
                {n.summary && <p className="mt-2 leading-relaxed text-ink-soft">{n.summary}</p>}
                {/* Hora de Argentina: una noticia publicada un martes a las
                    22 hs aparecía fechada el miércoles. */}
                {n.published_at && (
                  <p className="mt-2 font-mono text-xs text-ink-mute">
                    {fechaLarga(n.published_at)}
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
