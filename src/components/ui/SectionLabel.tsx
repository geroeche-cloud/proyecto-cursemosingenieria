import { Reveal } from "./Reveal";
import { cn } from "@/lib/cn";

/**
 * Encabezado de sección — estilo archivo/editorial.
 * Eyebrow monoespaciada + título grande + bajada opcional.
 */
export function SectionLabel({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <Reveal>
        <span
          className={cn(
            "eyebrow flex items-center gap-3",
            align === "center" && "justify-center"
          )}
        >
          <span className="metal-tick" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display text-[length:var(--text-h2)] font-semibold leading-[1.02] text-ink">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "text-[length:var(--text-lead)] leading-relaxed text-ink-soft",
              align === "center" ? "max-w-2xl" : "max-w-xl"
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
