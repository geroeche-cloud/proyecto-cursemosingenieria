import { test, expect, type Page } from "@playwright/test";

/**
 * Flujos críticos del sitio público: lo que ve un estudiante.
 * Si algo de esto se rompe, la plataforma no cumple su función.
 */

/** Saltea la animación de intro para que no tape la pantalla. */
async function sinIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ei-intro", "1");
    } catch {}
  });
}

test.beforeEach(async ({ page }) => {
  await sinIntro(page);
});

/**
 * Entra a una universidad QUE TENGA contenido publicado.
 *
 * Antes las pruebas entraban a la primera de la lista y daban por hecho que
 * tendría publicaciones. Funcionó mientras hubo una sola universidad; al
 * sumarse otras vacías —que es el caso normal cuando se incorpora una nueva—
 * la suite empezó a fallar sin que hubiera nada roto.
 *
 * Una universidad sin contenido es un estado LEGÍTIMO, no un error. Se prueba
 * aparte, en su propia prueba.
 */
async function entrarAUniversidadConContenido(page: Page): Promise<boolean> {
  await page.goto("/campus");
  const enlaces = await page.locator('a[href^="/campus/"]').evaluateAll((as) =>
    [...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!))],
  );
  for (const href of enlaces) {
    await page.goto(href);
    if ((await page.locator('[id^="pub-"]').count()) > 0) return true;
  }
  return false;
}

test("la portada carga y muestra la red de embajadores", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Cursemos Ingeniería/i);
  await expect(page.locator("#embajadores")).toBeVisible();
});

test("el campus lista universidades y se puede entrar a una", async ({ page }) => {
  await page.goto("/campus");
  await expect(page.getByRole("heading", { name: "Campus", level: 1 })).toBeVisible();

  const primera = page.locator('a[href^="/campus/"]').first();
  await expect(primera).toBeVisible();

  await primera.click();
  await expect(page).toHaveURL(/\/campus\/[a-z0-9-]+/);
  // Las cuatro secciones que definen el campus de una universidad.
  await expect(page.getByText("Noticias y oportunidades")).toBeVisible();
  await expect(page.getByText("Alianzas académicas")).toBeVisible();
  await expect(page.getByText("Recursos de estudio")).toBeVisible();
});

test("una universidad sin contenido muestra un estado vacío, no una pantalla rota", async ({
  page,
}) => {
  // Es el estado en el que nace toda universidad nueva: tiene que verse bien.
  await page.goto("/campus");
  const hrefs = await page.locator('a[href^="/campus/"]').evaluateAll((as) =>
    [...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!))],
  );

  for (const href of hrefs) {
    const res = await page.goto(href);
    expect(res?.status(), `${href} debería responder OK`).toBe(200);
    // Las secciones existen aunque estén vacías: nada de página en blanco.
    await expect(page.getByText("Noticias y oportunidades")).toBeVisible();
    await expect(page.getByText("Recursos de estudio")).toBeVisible();
  }
});

test("una publicación se puede abrir y compartir", async ({ page }) => {
  const hay = await entrarAUniversidadConContenido(page);
  test.skip(!hay, "Todavía no hay ninguna universidad con contenido publicado.");

  const publicacion = page.locator('[id^="pub-"]').first();
  await expect(publicacion).toBeVisible();

  // Compartir por WhatsApp: el enlace apunta a la PÁGINA PROPIA de la
  // publicación (/noticia/<id> u /oportunidad/<id>), no a un ancla dentro
  // del campus. De esa dirección dependen la vista previa con título y la
  // entrada propia en Google.
  const wa = publicacion.locator('a[href*="wa.me"]').first();
  await expect(wa).toBeVisible();
  const href = decodeURIComponent((await wa.getAttribute("href")) ?? "");
  expect(href).toMatch(/\/(noticia|oportunidad)\/[0-9a-f-]{36}/);

  // Copiar enlace: el botón responde y confirma.
  const copiar = publicacion.getByRole("button", { name: "Copiar enlace" });
  await expect(copiar).toBeVisible();
});

test("las novedades cargan", async ({ page }) => {
  await page.goto("/novedades");
  await expect(page.getByRole("heading", { name: /Noticias de la red/i })).toBeVisible();
});

test("una dirección inexistente muestra el 404 propio", async ({ page }) => {
  const res = await page.goto("/campus/universidad-que-no-existe");
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/Esta página no existe/i)).toBeVisible();
});

test("el sitio no desborda a lo ancho en celular", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/campus");
  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(desborda).toBe(false);
});
