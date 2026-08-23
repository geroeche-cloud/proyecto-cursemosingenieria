"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Solo permitimos volver a rutas internas (evita redirecciones a sitios externos). */
function safeNext(value: string | null): string | null {
  if (!value) return null;
  return /^\/(?!\/)/.test(value) ? value : null;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // La contraseña era correcta, pero eso NO alcanza para entrar: la cuenta
    // puede estar suspendida, dada de baja o sin universidad asignada.
    //
    // Se comprueba ACÁ, antes de redirigir. Antes no se comprobaba, así que la
    // persona llegaba al panel, el panel la rechazaba y la devolvía al login
    // sin ningún mensaje: clave correcta, "Ingresando…", y de vuelta a la misma
    // pantalla. Parecía que el login estaba roto, y no había forma de saber por
    // qué. Un rechazo que no se explica es indistinguible de una falla.
    let dest = "/panel";
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status, university_id, deleted_at")
        .eq("id", user.id)
        .single();

      const motivo = !profile
        ? "Tu cuenta todavía no está configurada. Escribinos y la dejamos lista."
        : profile.deleted_at
          ? "Tu cuenta fue dada de baja. Si creés que es un error, escribinos."
          : profile.status !== "active"
            ? "Tu cuenta está suspendida y no puede entrar al panel. Escribile al equipo de Cursemos para reactivarla."
            : profile.role === "ambassador" && !profile.university_id
              ? "Tu cuenta todavía no tiene una universidad asignada. Escribinos y lo resolvemos."
              : null;

      if (motivo) {
        // Se cierra la sesión: sin esto queda abierta una sesión que no sirve
        // para nada y que rebotaría en cada intento.
        await supabase.auth.signOut();
        setError(motivo);
        setLoading(false);
        return;
      }

      if (profile?.role === "admin") dest = "/admin";
    }

    router.push(safeNext(searchParams.get("next")) ?? dest);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
          Cursemos Ingeniería
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
          Acceso a la plataforma
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Ingresá con tu cuenta de embajador.</p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-soft">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-hair-strong bg-surface px-4 py-2.5 text-ink outline-none focus-visible:border-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-soft">Contraseña</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-hair-strong bg-surface px-4 py-2.5 text-ink outline-none focus-visible:border-blue-500"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-blue mt-2 disabled:opacity-60">
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
          <Link
            href="/recuperar"
            className="text-center text-xs text-ink-mute transition-colors hover:text-ink"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
      </div>
    </main>
  );
}

/** useSearchParams necesita un límite de Suspense en el App Router. */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
          <p className="text-sm text-ink-mute">Cargando…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
