import { test, expect, type Page } from "@playwright/test";

/**
 * Flujos con sesión del embajador: crear una noticia, verla en la lista,
 * consultar el informe y borrarla.
 *
 * Solo corre si hay una cuenta de prueba configurada. Para activarlas:
 *   PW_EMAIL=embajador@ejemplo.com PW_PASSWORD=... npm run test:e2e
 * (o cargando esas variables en .env.local / en los secrets de GitHub).
 *
 * Se recomienda una cuenta de prueba dedicada, no la de un embajador real:
 * la prueba crea y borra contenido.
 */

/**
 * De a una, no en paralelo.
 *
 * Las tres pruebas usan la MISMA cuenta. En paralelo abrían tres sesiones a la
 * vez del mismo usuario, cada una haciendo varias consultas seguidas contra una
 * base que está a unos 250 ms de ida y vuelta. La página del panel llegaba a
 * agotar el tiempo de espera: no por un fallo del sitio, sino por las pruebas
 * peleándose entre ellas por una cuenta compartida.
 */
test.describe.configure({ mode: "serial" });

const EMAIL = process.env.PW_EMAIL;
const PASSWORD = process.env.PW_PASSWORD;

test.skip(
  !EMAIL || !PASSWORD,
  "Configurá PW_EMAIL y PW_PASSWORD para probar los flujos con sesión.",
);

async function ingresar(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ei-intro", "1");
    } catch {}
  });
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(EMAIL!);
  await page.locator('input[type="password"]').fill(PASSWORD!);
  await page.getByRole("button", { name: /Ingresar/i }).click();

  // Se espera a SALIR del login. Ojo con la trampa: en este momento la URL ya
  // es /login, asi que esperar "panel|admin|login" se resuelve al instante con
  // la URL actual y da por fallado un inicio de sesion que iba a funcionar.
  // Hay que esperar el destino, y recien si no llega, mirar que paso.
  const entro = await page
    .waitForURL(
      (url) => url.pathname.startsWith("/panel") || url.pathname.startsWith("/admin"),
      { timeout: 25_000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!entro) {
    // La pantalla de login ahora explica por que rechaza; se repite ese texto
    // en el error de la prueba, que es lo unico que se ve al revisarla.
    const motivo = await page
      .locator("p.text-red-400")
      .first()
      .textContent()
      .catch(() => null);
    throw new Error(
      `La cuenta de prueba (${EMAIL}) no pudo entrar al panel. ` +
        (motivo?.trim()
          ? `La pantalla dice: "${motivo.trim()}"`
          : "La pantalla no mostro ningun motivo.") +
        " Revisala en Administracion, o usa otra y actualiza .env.test.",
    );
  }
}

test("un embajador puede crear una noticia y luego borrarla", async ({ page }) => {
  await ingresar(page);
  await page.goto("/panel/noticias");

  const titulo = `Prueba automática ${Date.now()}`;
  await page.locator('input[name="title"]').fill(titulo);
  await page.locator('input[name="summary"]').fill("Noticia generada por las pruebas.");
  await page.getByRole("button", { name: /Guardar como borrador/i }).click();

  // Aparece en la lista como borrador.
  const fila = page.locator("article", { hasText: titulo });
  await expect(fila).toBeVisible({ timeout: 15_000 });
  await expect(fila.getByText("Borrador")).toBeVisible();

  // Se limpia lo que creó la prueba.
  await fila.getByRole("button", { name: /^Borrar$/ }).click();
  await expect(page.locator("article", { hasText: titulo })).toHaveCount(0, { timeout: 15_000 });
});

test("las secciones del panel abren sin errores", async ({ page }) => {
  await ingresar(page);
  for (const ruta of [
    "/panel",
    "/panel/informes",
    "/panel/noticias",
    "/panel/oportunidades",
    "/panel/profesores",
    "/panel/drives",
    "/panel/cuenta",
  ]) {
    const res = await page.goto(ruta);
    expect(res?.status(), `${ruta} debería responder OK`).toBeLessThan(400);
  }
});

test("el informe del embajador muestra métricas y permite descargarlo", async ({ page }) => {
  await ingresar(page);
  await page.goto("/panel/informes");
  await expect(page.getByText(/Estudiantes alcanzados/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Descargar PDF/i })).toBeVisible();
});
