import { Logo } from "@/components/ui/Logo";
import { NAV, ORG, SOCIALS, PILLARS } from "@/lib/org";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-hair pt-16 pb-8">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Logo className="h-9" shimmer />
              <span className="font-display text-base font-semibold text-ink">{ORG.name}</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink-mute">{ORG.statement}</p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ti-500">
              {PILLARS.join(" · ")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="eyebrow">Navegación</p>
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="w-fit text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="eyebrow">Conectar con el fundador</p>
            {SOCIALS.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {s.label} <span className="text-ink-mute">· {s.handle}</span>
              </a>
            ))}
            <a
              href={`mailto:${ORG.email}`}
              className="w-fit text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {ORG.email}
            </a>
          </div>
        </div>

        <div className="metal-divider my-9" />

        <div className="flex flex-col items-center justify-between gap-3 font-mono text-xs text-ink-mute sm:flex-row">
          <p>© {year} {ORG.name}. Est. {ORG.established}.</p>
          <p>Construido y documentado en público.</p>
        </div>
      </div>
    </footer>
  );
}
