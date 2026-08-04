import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "blue" | "green" | "amber" | "steel";

const TONES: Record<Tone, string> = {
  blue: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  steel: "border-hair-strong bg-white/[0.04] text-ti-300",
};

const DOTS: Record<Tone, string> = {
  blue: "bg-blue-400",
  green: "bg-emerald-400",
  amber: "bg-amber-300",
  steel: "bg-ti-300",
};

export function Badge({
  tone = "steel",
  dot = false,
  pulse = false,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em]",
        TONES[tone],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[tone], pulse && "pulse-dot")} />
      )}
      {children}
    </span>
  );
}
