import { test, expect } from "@playwright/test";

/**
 * Pruebas de ESTABILIDAD, no de rendimiento.
 *
 * Los dos peores problemas que tuvo este proyecto en producción no aparecían
 * en ninguna medición de velocidad: la barra de navegación había dejado de
 * estar fija en todo el sitio, y las tarjetas del campus no se podían tocar
 * porque nunca dejaban de moverse. Las dos se veían perfectas en una captura.
 *
 * Esto las habría atrapado antes de publicar.
 */

async function sinIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ei-intro", "1");
    } catch {}
  });
}

test("la barra de navegación sigue fija al hacer scroll", async ({ page }) => {
  await sinIntro(page);
  for (const ruta of ["/", "/campus"]) {
    await page.goto(ruta);
    const barra = page.locator("header").first();
    await expect(barra).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(400);

    const arriba = await barra.evaluate((el) => Math.round(el.getBoundingClientRect().top));
    // Si una animación deja un transform colgado, el contenedor de la página
    // pasa a ser el marco de referencia y la barra se va con el scroll.
    expect(Math.abs(arriba), `la barra se despegó en ${ruta} (top ${arriba})`).toBeLessThan(80);
  }
});

test("ninguna animación deja un transform colgado en el contenedor", async ({ page }) => {
  await sinIntro(page);
  await page.goto("/campus");
  await page.waitForTimeout(1500);
  const t = await page.evaluate(() => {
    const el = document.querySelector(".entrada-ruta");
    return el ? getComputedStyle(el).transform : "none";
  });
  expect(t, "el contenedor de la página quedó con transform").toBe("none");
});

test("las tarjetas del campus se pueden tocar de inmediato", async ({ page }) => {
  await sinIntro(page);
  await page.goto("/campus");

  const tarjeta = page.locator('a[href^="/campus/"]').first();
  await expect(tarjeta).toBeVisible();

  // Playwright espera a que el elemento esté quieto antes de tocarlo. Si algo
  // se anima para siempre, esto se agota — y un dedo tampoco podría.
  const t0 = Date.now();
  await tarjeta.click({ timeout: 8000 });
  const tardo = Date.now() - t0;

  await page.waitForURL(/\/campus\/[^/]+$/, { timeout: 15_000 });
  expect(tardo, "la tarjeta no estaba quieta").toBeLessThan(5000);
});

/**
 * Cuenta el contenido que está en la página pero con opacidad cero.
 *
 * Esto existe porque `toBeVisible()` de Playwright NO mira la opacidad, e
 * `innerText` tampoco: un elemento invisible pasa las dos comprobaciones. Con
 * eso, una página completamente en blanco daba todo verde mientras en
 * producción no se veía nada. La medición tiene que ser "se ve", no "existe".
 */
async function contenidoInvisible(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter((el) => {
      const r = el.getBoundingClientRect();
      // Se exige un margen de 100 px contra el borde inferior. El observador
      // revela con un margen de 80: un elemento que apenas asoma abajo todavía
      // NO tiene que estar visible, y es correcto que no lo esté. Sin este
      // margen la prueba marcaba como error el funcionamiento normal.
      const bienDentro = r.top < window.innerHeight - 100 && r.bottom > 0;
      return bienDentro && parseFloat(getComputedStyle(el).opacity) < 0.9;
    }).length,
  );
}

test("al NAVEGAR (no recargar) el contenido se ve, no queda invisible", async ({ page }) => {
  await sinIntro(page);
  await page.goto("/");

  // Navegación del lado del cliente: el layout NO se vuelve a montar. Si algo
  // depende de ese montaje para mostrar contenido, acá se cae.
  await page.locator('a[href="/campus"]').first().click();
  await page.waitForURL("**/campus");
  await page.waitForTimeout(1500);

  const tapado = await contenidoInvisible(page);
  expect(tapado, "hay contenido del Campus en opacidad 0 tras navegar").toBe(0);

  await page.locator('a[href^="/campus/"]').first().click();
  await page.waitForURL(/\/campus\/[^/]+$/);
  await page.waitForTimeout(1500);
  expect(await contenidoInvisible(page), "contenido invisible en la universidad").toBe(0);

  await page.goBack();
  await page.waitForURL("**/campus");
  await page.waitForTimeout(1500);
  expect(await contenidoInvisible(page), "contenido invisible al volver atrás").toBe(0);
});

test("navegar y volver atrás deja el contenido completo", async ({ page }) => {
  await sinIntro(page);
  await page.goto("/");

  await page.locator('a[href="/campus"]').first().click();
  await page.waitForURL("**/campus");
  await expect(page.locator('a[href^="/campus/"]').first()).toBeVisible();

  await page.locator('a[href^="/campus/"]').first().click();
  await page.waitForURL(/\/campus\/[^/]+$/);
  await page.goBack();

  await page.waitForURL("**/campus");
  await expect(page.locator('a[href^="/campus/"]').first()).toBeVisible();
});

test("la intro no queda tapando ninguna página", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1800);
  for (const ruta of ["/", "/campus", "/novedades"]) {
    await page.goto(ruta);
    await page.waitForTimeout(1200);
    const tapa = await page.evaluate(() => {
      const i = document.querySelector(".intro");
      if (!i) return false;
      const s = getComputedStyle(i);
      return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
    });
    expect(tapa, `la intro seguía visible en ${ruta}`).toBe(false);
  }
});
