"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NAV, ORG } from "@/lib/org";
import { cn } from "@/lib/cn";

/** Ícono de birrete para el acceso destacado a Academia. */
function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  // `montado` mantiene el menú en el DOM mientras corre la animación de salida;
  // `cerrando` dispara esa animación. Es lo que antes hacía AnimatePresence,
  // en dos booleanos en vez de una librería.
  const [montado, setMontado] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const open = montado && !cerrando;

  const abrir = () => {
    setMontado(true);
    setCerrando(false);
  };
  const cerrar = () => setCerrando(true);
  const alternar = () => (open ? cerrar() : abrir());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "py-2" : "py-4"
        )}
      >
        <div className="shell">
          <nav
            className={cn(
              "flex items-center justify-between rounded-full px-3 py-2 transition-all duration-500 sm:px-4",
              scrolled ? "glass" : "border border-transparent"
            )}
          >
            <Link href="/" className="group flex items-center gap-2.5 pl-1" aria-label={ORG.name}>
              <Logo className="h-7 transition-transform duration-500 group-hover:scale-105" />
              <span className="hidden font-display text-sm font-semibold tracking-tight text-ink sm:block">
                Cursemos <span className="text-ink-mute">Ingeniería</span>
              </span>
            </Link>

            <div className="hidden items-center gap-0.5 lg:flex">
              {NAV.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link href="/campus" className="btn btn-blue !px-4 !py-2 text-sm">
                <CapIcon />
                Campus
              </Link>
              <Link href="/#colaborar" className="btn btn-metal hidden !px-5 !py-2 text-sm md:inline-flex">
                Contacto
              </Link>
              <button
                type="button"
                onClick={alternar}
                aria-label="Menú"
                aria-expanded={open}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-hair-strong bg-white/[0.03] lg:hidden"
              >
                <div className="flex flex-col items-center justify-center gap-[5px]">
                  <span className={cn("h-px w-5 bg-ink transition-all duration-300", open && "translate-y-[3px] rotate-45")} />
                  <span className={cn("h-px w-5 bg-ink transition-all duration-300", open && "-translate-y-[3px] -rotate-45")} />
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Menú móvil: entrada y salida por CSS. Antes esto arrastraba la
          librería de animación entera al sitio público para hacer un
          desvanecido con un deslizamiento. */}
      {montado && (
        <div
          className={cn("menu-capa fixed inset-0 z-40 lg:hidden", cerrando && "cerrando")}
          onAnimationEnd={(e) => {
            // Solo al terminar el cierre de la capa: ahí recién se desmonta.
            if (e.target === e.currentTarget && cerrando) {
              setMontado(false);
              setCerrando(false);
            }
          }}
        >
          <div className="absolute inset-0 bg-bg/85 backdrop-blur-xl" onClick={cerrar} />
          <nav className="menu-panel relative flex h-full flex-col justify-center gap-1 px-8 pt-20">
            {NAV.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={cerrar}
                className="menu-link font-display text-3xl font-medium text-ink"
                style={{ animationDelay: `${0.08 + i * 0.05}s` }}
              >
                {l.label}
              </a>
            ))}
            <Link href="/campus" onClick={cerrar} className="btn btn-blue mt-8 w-fit text-sm">
              <CapIcon />
              Campus
            </Link>
            <Link href="/#colaborar" onClick={cerrar} className="btn btn-metal mt-3 w-fit text-sm">
              Contacto
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
