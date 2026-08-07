import { test, expect } from "@playwright/test";
import { traducirError } from "../src/lib/errores";

/**
 * El traductor se prueba con los errores REALES que ya rompieron este proyecto,
 * no con casos inventados. Si alguno vuelve a aparecer, tiene que seguir
 * saliendo con un mensaje entendible y apuntando a la migración correcta.
 */

test("el error de ambigüedad de columnas apunta a la 0011", () => {
  const r = traducirError(
    { message: 'column reference "kind" is ambiguous', code: "42702" },
    { admin: true },
  );
  expect(r.configuracion).toBe(true);
  expect(r.migracion).toBe("0011_fix_ambiguedad.sql");
  expect(r.mensaje).toContain("0011_fix_ambiguedad.sql");
});

test("la función de medición que no existe apunta a la 0010", () => {
  const r = traducirError(
    {
      message: "Could not find the function public.track_event(kind, row_id, vid) in the schema cache",
      code: "PGRST202",
    },
    { admin: true },
  );
  expect(r.configuracion).toBe(true);
  expect(r.migracion).toBe("0010_informes.sql");
});

test("los permisos de informes apuntan a la 0012", () => {
  const r = traducirError(
    { message: "permission denied for function report_stats" },
    { admin: true },
  );
  expect(r.migracion).toBe("0012_permisos_informes.sql");
});

test("la columna deleted_at que falta apunta a la papelera (0008)", () => {
  const r = traducirError(
    { message: 'column news.deleted_at does not exist', code: "42703" },
    { admin: true },
  );
  expect(r.migracion).toBe("0008_papelera.sql");
});

test("la tabla click_events que falta apunta a la 0009", () => {
  const r = traducirError(
    { message: 'relation "public.click_events" does not exist', code: "42P01" },
    { admin: true },
  );
  expect(r.migracion).toBe("0009_click_events.sql");
});

test("al embajador NO se le nombra ninguna migración", () => {
  const r = traducirError(
    { message: "permission denied for function report_stats" },
    { admin: false },
  );
  expect(r.mensaje).not.toContain(".sql");
  expect(r.mensaje).toContain("administrador");
});

test("los errores del contenido no se marcan como configuración", () => {
  for (const caso of [
    { message: "duplicate key value violates unique constraint", code: "23505" },
    { message: "null value in column title violates not-null", code: "23502" },
    { message: "value too long for type character varying(80)", code: "22001" },
  ]) {
    const r = traducirError(caso);
    expect(r.configuracion, caso.message).toBe(false);
    expect(r.mensaje).not.toMatch(/[a-z]+_[a-z]+\.sql/);
  }
});

test("la sesión vencida se explica en castellano", () => {
  const r = traducirError({ message: "JWT expired" });
  expect(r.mensaje).toContain("sesión");
  expect(r.configuracion).toBe(false);
});

test("un error desconocido no se pierde", () => {
  const r = traducirError({ message: "algo rarísimo pasó" });
  expect(r.mensaje).toBe("algo rarísimo pasó");
});

test("ningún mensaje traducido queda en inglés técnico", () => {
  const casos = [
    { message: "Could not find the function public.report_stats", code: "PGRST202" },
    { message: "new row violates row-level security policy", code: "42501" },
    { message: "Invalid login credentials" },
    { message: "fetch failed" },
  ];
  for (const c of casos) {
    const r = traducirError(c, { admin: false });
    expect(r.mensaje, c.message).not.toContain(c.message);
  }
});
