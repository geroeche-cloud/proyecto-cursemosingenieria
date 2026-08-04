import { getSessionUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
        Administración
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        Panel de Cursemos Ingeniería
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Sesión iniciada como {user?.email}</p>

      <form action="/auth/signout" method="post" className="mt-8">
        <button type="submit" className="btn btn-ghost">
          Cerrar sesión
        </button>
      </form>

      <p className="mt-12 text-sm text-ink-mute">
        La gestión de universidades y embajadores se activa en el próximo paso.
      </p>
    </div>
  );
}
