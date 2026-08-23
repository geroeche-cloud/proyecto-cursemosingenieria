import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { texto, fecha, LIMITES } from "../src/lib/validar";

/**
 * Que la validación coincida con lo que el campo REALMENTE es.
 *
 * Esto existe por un error concreto: "Fecha límite" en oportunidades es un
 * campo de TEXTO LIBRE —se escribe "Inscripción hasta el 30/09" o "Hasta
 * agotar cupos"—, y su columna en la base es `text`. Al agregar validaciones
 * se lo trató como fecha, y desde entonces rechazaba absolutamente todo lo que
 * un embajador escribiera ahí. El formulario se volvió imposible de completar.
 *
 * Es un error silencioso para quien programa —el código se lee perfecto— y
 * total para quien usa la plataforma. Solo aparece al intentar cargar algo.
 */

/** Todos los archivos de un directorio, recursivo. */
function archivos(dir: string, ext: RegExp): string[] {
  const salida: string[] = [];
  for (const n of readdirSync(dir)) {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) salida.push(...archivos(p, ext));
    else if (ext.test(n)) salida.push(p);
  }
  return salida;
}

test("todo campo validado como fecha se pide como fecha en el formulario", () => {
  const raiz = path.join(process.cwd(), "src", "app", "panel");
  const formularios = archivos(raiz, /Form\.tsx$/)
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");

  const problemas: string[] = [];

  for (const accion of archivos(raiz, /actions\.ts$/)) {
    const codigo = readFileSync(accion, "utf8");
    for (const m of codigo.matchAll(/fecha\(formData\.get\("([a-z_]+)"\)/g)) {
      const campo = m[1];
      // El formulario tiene que pedirlo con un selector de fecha.
      const esDate = new RegExp(`type="date"[^>]*name="${campo}"|name="${campo}"[^>]*type="date"`);
      if (!esDate.test(formularios)) {
        problemas.push(
          `"${campo}" se valida como fecha pero el formulario NO lo pide con type="date" ` +
            `(${path.relative(process.cwd(), accion)})`,
        );
      }
    }
  }

  expect(problemas).toEqual([]);
});

test('"Fecha límite" acepta el texto libre que la gente realmente escribe', () => {
  // Casos reales de un formulario de oportunidades.
  for (const v of [
    "Inscripción hasta el 30/09",
    "Hasta agotar cupos",
    "Todo octubre",
    "Cierra el viernes 🗓️",
    "30/09/2026",
  ]) {
    expect(
      () => texto(v, "La fecha limite", LIMITES.fechaLimite),
      `deberia aceptarse: ${v}`,
    ).not.toThrow();
  }
  // Y esos mismos textos NO son fechas: si se validaran como tales, fallarían.
  expect(() => fecha("Hasta agotar cupos", "x")).toThrow();
});
