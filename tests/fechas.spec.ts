import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fechaLarga, fechaCorta, hora, todayAR, ZONA } from "../src/lib/schedule";

/**
 * Todo lo que se muestre con fecha u hora va en horario de Argentina.
 *
 * El código corre en los servidores de Vercel, que están en UTC. Un
 * `toLocaleDateString("es-AR")` sin zona NO usa la hora de Argentina: usa la
 * del servidor y solo cambia el idioma. Son tres horas de diferencia.
 *
 * En un informe se ve como una hora equivocada. En una fecha es peor y más
 * difícil de notar: todo lo que pase entre las 21:00 y la medianoche se muestra
 * con la fecha del DÍA SIGUIENTE.
 */

/** Simula el servidor: fuerza UTC y comprueba que igual salga la hora de acá. */
function conServidorEnUTC<T>(fn: () => T): T {
  const antes = process.env.TZ;
  process.env.TZ = "UTC";
  try {
    return fn();
  } finally {
    process.env.TZ = antes;
  }
}

test("con el servidor en UTC, las fechas salen igual en horario argentino", () => {
  // 2 de enero de 2026, 01:30 UTC = 1 de enero, 22:30 en Argentina.
  const cruce = "2026-01-02T01:30:00Z";

  conServidorEnUTC(() => {
    expect(fechaLarga(cruce), "el día se corrió: falta la zona horaria").toContain("1 de enero");
    expect(fechaLarga(cruce)).toContain("2026");
    expect(fechaCorta(cruce)).toContain("01");
    // 24 horas, como se escribe acá. Sin hour12:false salía "10:30 p. m.".
    expect(hora(cruce)).toBe("22:30");
  });
});

test("la hora se muestra en formato de 24 horas", () => {
  expect(hora("2026-08-08T20:05:00Z")).toBe("17:05");
  expect(hora("2026-08-08T03:00:00Z")).toBe("00:00");
  expect(hora(), "la hora actual debería tener formato HH:MM").toMatch(/^\d{2}:\d{2}$/);
});

test("el cambio de día se calcula con la hora de acá, no la del servidor", () => {
  // A las 23:00 de Argentina ya es el día siguiente en UTC.
  const hoy = todayAR();
  expect(hoy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(hoy).toBe(
    new Date().toLocaleDateString("en-CA", { timeZone: ZONA }),
  );
});

test("una fecha inválida no rompe la pantalla", () => {
  for (const v of ["", "no es fecha", null, undefined]) {
    expect(() => fechaLarga(v)).not.toThrow();
    expect(() => hora(v)).not.toThrow();
  }
  expect(fechaLarga("no es fecha")).toBe("");
});

/**
 * La red de seguridad de verdad: que nadie vuelva a formatear una fecha sin
 * declarar la zona. Es un error silencioso —el texto se ve bien, solo está
 * corrido— así que revisarlo a ojo no alcanza.
 */
test("ningún archivo formatea fechas sin declarar la zona horaria", () => {
  const raiz = path.join(process.cwd(), "src");
  const culpables: string[] = [];

  const recorrer = (dir: string) => {
    for (const nombre of readdirSync(dir)) {
      const p = path.join(dir, nombre);
      if (statSync(p).isDirectory()) {
        recorrer(p);
        continue;
      }
      if (!/\.tsx?$/.test(nombre)) continue;
      // schedule.ts es el dueño de la zona: es el único que puede declararla.
      if (p.endsWith(path.join("lib", "schedule.ts"))) continue;

      const codigo = readFileSync(p, "utf8");
      if (/toLocale(Date|Time|)String\s*\(/.test(codigo)) {
        culpables.push(path.relative(process.cwd(), p));
      }
    }
  };
  recorrer(raiz);

  expect(
    culpables,
    "usá fechaLarga, fechaCorta u hora de lib/schedule en vez de toLocaleDateString",
  ).toEqual([]);
});
