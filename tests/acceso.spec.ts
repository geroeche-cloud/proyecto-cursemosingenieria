import { test, expect, type Page } from "@playwright/test";

/**
 * Seguridad de acceso: nadie sin sesión puede entrar al panel ni al admin.
 * Es la prueba más importante de todas — un fallo acá expone la plataforma.
 *
 * Los flujos con sesión (crear una noticia, publicarla) están en
 * tests/panel.spec.ts y necesitan una cuenta de prueba.
 */

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

const rutasPrivadas = [
  "/panel",
  "/panel/noticias",
  "/panel/informes",
  "/admin",
  "/admin/informes",
  "/admin/papelera",
  "/admin/diagnostico",
  "/preview",
];

for (const ruta of rutasPrivadas) {
  test(`sin sesión, ${ruta} redirige al ingreso`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page).toHaveURL(/\/login/);
  });
}

test("la pantalla de ingreso funciona y ofrece recuperar la contraseña", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Acceso a la plataforma/i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole("link", { name: /Olvidaste tu contraseña/i })).toBeVisible();
});

test("los campos no provocan zoom en celular (fuente de 16px)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/login");
  const tam = await page
    .locator('input[type="email"]')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(tam).toBeGreaterThanOrEqual(16);
});

test("las zonas privadas no se indexan en buscadores", async ({ page }) => {
  const res = await page.goto("/robots.txt");
  const txt = (await res?.text()) ?? "";
  for (const zona of ["/admin", "/panel", "/preview"]) {
    expect(txt).toContain(`Disallow: ${zona}`);
  }
});
