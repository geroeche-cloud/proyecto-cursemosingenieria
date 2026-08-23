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

  // Si la cuenta está suspendida o en la papelera, el inicio de sesión FUNCIONA
  // —la contraseña sigue siendo válida— pero el panel la rechaza y la devuelve
  // al login. Sin esta comprobación, la prueba se quedaba 45 segundos buscando
  // un campo que nunca iba a aparecer, y fallaba con un "tiempo agotado" que no
  // explica nada. Conviene decir exactamente qué pasó.
  await page.waitForURL(/\/(panel|admin|login)/, { timeout: 20_000 });
  if (/\/login/.test(page.url())) {
    throw new Error(
      `La cuenta de prueba (${EMAIL}) no puede entrar al panel. Suele ser porque ` +
        "está suspendida o en la papelera: reactivala desde Administración, o " +
        "creá otra y actualizá .env.test.",
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
