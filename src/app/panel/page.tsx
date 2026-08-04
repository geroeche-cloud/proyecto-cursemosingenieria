import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PanelPage() {
  const user = await getSessionUser();
  const supabase = await createClient();

  const { data: uni } = await supabase
    .from("universities")
    .select("name, short_name")
    .eq("id", user!.university_id!)
    .single();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
        Panel del embajador
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        {uni?.name ?? "Tu universidad"}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Sesión iniciada como {user?.email}</p>

      <form action="/auth/signout" method="post" className="mt-8">
        <button type="submit" className="btn btn-ghost">
          Cerrar sesión
        </button>
      </form>

      <p className="mt-12 text-sm text-ink-mute">
        El módulo de Noticias se activa en el próximo paso.
      </p>
    </div>
  );
}
