import { test, expect } from "@playwright/test";

/**
 * La política de privacidad tiene que existir, verse y ser alcanzable.
 *
 * Una página legal es de las que nadie visita hasta que hace falta: si se rompe,
 * nadie lo nota. Y justo es de las que no pueden estar rotas cuando alguien las
 * busca — normalmente porque tiene un problema.
 */

async function sinIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ei-intro", "1");
    } catch {}
  });
}

test("la política de privacidad carga y tiene contenido", async ({ page }) => {
  await sinIntro(page);
  const res = await page.goto("/privacidad");
  expect(res?.status()).toBe(200);

  await expect(page.getByRole("heading", { name: /Política de privacidad/i })).toBeVisible();

  // Los apartados que la vuelven útil, no solo un texto de relleno.
  for (const seccion of [
    /Qué se guarda cuando visitás/i,
    /Cookies/i,
    /profesor/i,
    /Con quién se comparte/i,
    /Tus derechos/i,
  ]) {
    await expect(page.getByRole("heading", { name: seccion })).toBeVisible();
  }

  // Tiene que haber una forma real de contactar para ejercer los derechos.
  await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
});

test("se llega a la política desde cualquier página", async ({ page }) => {
  await sinIntro(page);
  for (const desde of ["/", "/campus", "/novedades"]) {
    await page.goto(desde);
    const enlace = page.locator('a[href="/privacidad"]').first();
    await expect(enlace, `no hay enlace a la política desde ${desde}`).toBeVisible();
  }
});

test("la política figura en el mapa del sitio", async ({ page }) => {
  const res = await page.goto("/sitemap.xml");
  expect(res?.status()).toBe(200);
  expect(await res!.text()).toContain("/privacidad");
});

test("el aviso de borrador está a la vista mientras no haya revisión legal", async ({ page }) => {
  // Publicar un texto legal sin revisar y sin decirlo sería peor que no tenerlo.
  // Cuando un profesional lo revise, se quita el aviso Y esta comprobación.
  await sinIntro(page);
  await page.goto("/privacidad");
  await expect(page.getByText(/pendiente de revisión legal/i)).toBeVisible();
});
