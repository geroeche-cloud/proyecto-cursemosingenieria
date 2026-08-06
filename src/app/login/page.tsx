"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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

    // Redirigir según el rol.
    let dest = "/panel";
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") dest = "/admin";
    }

    router.push(dest);
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
