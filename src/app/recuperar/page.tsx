"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      "/recuperar/nueva",
    )}`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);

    // No revelamos si el email existe o no (seguridad: anti-enumeración).
    if (err && !/rate limit/i.test(err.message)) {
      setError("No se pudo enviar el email. Probá de nuevo en un momento.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
          Cursemos Ingeniería
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
          Recuperar contraseña
        </h1>

        {sent ? (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-ink-soft">
              Si <span className="font-medium text-ink">{email}</span> tiene una cuenta, te
              enviamos un email con un enlace para crear una nueva contraseña. Revisá también
              el spam.
            </p>
            <Link href="/login" className="btn btn-ghost self-start text-sm">
              Volver al ingreso
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              Te enviamos un enlace para crear una nueva.
            </p>
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

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button type="submit" disabled={loading} className="btn btn-blue mt-2 disabled:opacity-60">
                {loading ? "Enviando…" : "Enviarme el enlace"}
              </button>
              <Link href="/login" className="text-center text-xs text-ink-mute hover:text-ink">
                Volver al ingreso
              </Link>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
