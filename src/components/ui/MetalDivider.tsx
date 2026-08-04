import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

/**
 * Metallic section divider — a bright brushed-metal hairline with an optional
 * centered monogram. Breaks up large dark gaps with a premium "CEO" accent.
 */
export function MetalDivider({
  withMark = false,
  className,
}: {
  withMark?: boolean;
  className?: string;
}) {
  if (withMark) {
    return (
      <div className={cn("shell", className)}>
        <div className="flex items-center gap-5">
          <span className="metal-divider" />
          <Logo className="h-6 opacity-90" shimmer />
          <span className="metal-divider" />
        </div>
      </div>
    );
  }
  return (
    <div className={cn("shell", className)}>
      <span className="metal-divider block" />
    </div>
  );
}
