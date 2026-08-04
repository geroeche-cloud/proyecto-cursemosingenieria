import Link from "next/link";

/** Migas de pan del Campus (Campus / Universidad / Área). */
export function CampusCrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Ruta"
      className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-mute"
    >
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint">/</span>}
          {it.href ? (
            <Link href={it.href} className="transition-colors hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink-soft">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
