"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Phase = "checking" | "ready" | "invalid" | "done";

export default function NuevaPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // El handler /auth/callback ya dejó la sesión de recuperación en la cookie.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setPhase(data.session ? "ready" : "invalid");
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError("No se pudo actualizar. Pedí un enlace nuevo.");
      return;
    }
    setPhase("done");
    setTimeout(() => {
      router.push("/panel");
      router.refresh();
    }, 1200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
          Cursemos Ingeniería
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Nueva contraseña</h1>

        {phase === "checking" && (
          <p className="mt-4 text-sm text-ink-soft">Verificando el enlace…</p>
        )}

        {phase === "invalid" && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-ink-soft">
              El enlace no es válido o expiró. Pedí uno nuevo.
            </p>
            <Link href="/recuperar" className="btn btn-blue self-start text-sm">
              Pedir un enlace nuevo
            </Link>
          </div>
        )}

        {phase === "done" && (
          <p className="mt-4 text-sm text-emerald-400">
            Contraseña actualizada. Entrando…
          </p>
        )}

        {phase === "ready" && (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-soft">Nueva contraseña</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-hair-strong bg-surface px-4 py-2.5 text-ink outline-none focus-visible:border-blue-500"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-soft">Repetir contraseña</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-xl border border-hair-strong bg-surface px-4 py-2.5 text-ink outline-none focus-visible:border-blue-500"
              />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-blue mt-2 disabled:opacity-60">
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
