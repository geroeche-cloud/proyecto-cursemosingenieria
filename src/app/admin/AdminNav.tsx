"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/universidades", label: "Universidades" },
  { href: "/admin/embajadores", label: "Embajadores" },
  { href: "/admin/perfiles", label: "Perfiles" },
  { href: "/admin/moderacion", label: "Moderación" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = t.exact
          ? path === t.href
          : path === t.href || path.startsWith(`${t.href}/`);
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
