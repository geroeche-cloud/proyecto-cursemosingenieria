import Link from "next/link";

/** 404 con la identidad de la plataforma y salidas útiles. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">Error 404</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Esta página no existe
        </h1>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Puede que el enlace esté viejo o que el contenido ya no esté publicado.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/campus" className="btn btn-blue text-sm">
            Ver el campus
          </Link>
          <Link href="/" className="btn btn-ghost text-sm">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
