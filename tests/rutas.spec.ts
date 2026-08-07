import { test, expect } from "@playwright/test";
import { esZonaDeTrabajo } from "../src/lib/rutas";

/**
 * De esta función depende que el panel no cargue la intro con sonido, el fondo
 * con luces ni la transición de 450 ms. Si algún día devuelve false de más, el
 * panel se vuelve lento sin que nadie note por qué.
 */

test("el panel, la administración y la vista previa son zonas de trabajo", () => {
  for (const ruta of [
    "/panel",
    "/panel/noticias",
    "/panel/noticias/abc-123",
    "/panel/informes/pdf",
    "/admin",
    "/admin/diagnostico",
    "/admin/informes",
    "/preview",
  ]) {
    expect(esZonaDeTrabajo(ruta), ruta).toBe(true);
  }
});

test("el sitio público NO es zona de trabajo", () => {
  for (const ruta of [
    "/",
    "/campus",
    "/campus/unco",
    "/novedades",
    "/login",
    "/recuperar",
    "/recuperar/nueva",
  ]) {
    expect(esZonaDeTrabajo(ruta), ruta).toBe(false);
  }
});

test("sin ruta no se rompe", () => {
  expect(esZonaDeTrabajo(null)).toBe(false);
  expect(esZonaDeTrabajo("")).toBe(false);
});
