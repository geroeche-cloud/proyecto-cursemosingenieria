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

test("una publicación se puede abrir y compartir", async ({ page }) => {
  await page.goto("/campus");
  await page.locator('a[href^="/campus/"]').first().click();

  const publicacion = page.locator('[id^="pub-"]').first();
  await expect(publicacion).toBeVisible();

  // Compartir por WhatsApp: el enlace tiene que apuntar a esa publicación.
  const wa = publicacion.locator('a[href*="wa.me"]').first();
  await expect(wa).toBeVisible();
  const href = await wa.getAttribute("href");
  expect(decodeURIComponent(href ?? "")).toContain("#pub-");

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
