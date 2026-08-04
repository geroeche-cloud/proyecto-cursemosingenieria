import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Logo oficial de Cursemos Ingeniería — ícono cerebro + circuito metálico.
 * (`shimmer` se acepta por compatibilidad; el logo ya es metálico.)
 */
export function Logo({ className }: { className?: string; shimmer?: boolean }) {
  return (
    <Image
      src="/images/cursemos-icon.png"
      alt="Cursemos Ingeniería"
      width={452}
      height={416}
      className={cn("w-auto object-contain", className)}
    />
  );
}
