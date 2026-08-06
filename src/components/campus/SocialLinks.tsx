"use client";

import { trackClick, type EventKind } from "./TrackedLink";

export type SocialItem = { label: string; href: string };

const KIND_BY_LABEL: Record<string, EventKind> = {
  Mail: "social:mail",
  Instagram: "social:instagram",
  TikTok: "social:tiktok",
  YouTube: "social:youtube",
  LinkedIn: "social:linkedin",
};

/**
 * Redes del embajador con medición: cada clic queda registrado para los
 * informes ("tráfico enviado a Instagram, LinkedIn…"). En vista previa no cuenta.
 */
export function SocialLinks({
  universityId,
  socials,
  track = true,
}: {
  universityId: string;
  socials: SocialItem[];
  track?: boolean;
}) {
  if (socials.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5">
      {socials.map((s) => {
        const external = !s.href.startsWith("mailto:");
        const kind = KIND_BY_LABEL[s.label];
        return (
          <a
            key={s.label}
            href={s.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={() => track && kind && trackClick(kind, universityId)}
            className="chip rounded-full px-3.5 py-1.5 text-sm font-medium text-ti-100 transition-colors hover:text-white"
          >
            {s.label}
          </a>
        );
      })}
    </div>
  );
}
