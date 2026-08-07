"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { esZonaDeTrabajo } from "@/lib/rutas";

/**
 * Transición sutil de entrada en cada navegación de ruta.
 *
 * En el panel y la administración se saltea por completo. Eran 450 ms de espera
 * cada vez que el embajador cambiaba de sección: la página ya estaba lista y el
 * navegador la mantenía invisible, desvaneciéndola. En el sitio público eso es
 * elegancia; en una herramienta de trabajo que se usa muchas veces por día es
 * lentitud pura, y encima de la peor clase, porque es autoinfligida.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  if (esZonaDeTrabajo(usePathname())) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
