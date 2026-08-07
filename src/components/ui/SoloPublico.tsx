"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { esZonaDeTrabajo } from "@/lib/rutas";

/** Muestra su contenido solo en el sitio público, nunca en panel ni admin. */
export function SoloPublico({ children }: { children: ReactNode }) {
  return esZonaDeTrabajo(usePathname()) ? null : <>{children}</>;
}
