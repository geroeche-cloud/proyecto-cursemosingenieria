"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/panel/noticias", label: "Noticias" },
  { href: "/panel/oportunidades", label: "Oportunidades" },
  { href: "/panel/profesores", label: "Profesores" },
  { href: "/panel/drives", label: "Drives" },
];

export function PanelNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = path === t.href || path.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-blue-500 text-ink"
                : "border-transparent text-ink-mute hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
