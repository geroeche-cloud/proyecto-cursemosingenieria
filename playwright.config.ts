import { defineConfig, devices } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";

/**
 * Carga las variables de entorno en el proceso de pruebas.
 *
 * Next lee .env.local solo para la aplicación, no para quien la prueba. Sin
 * esto, las pruebas de aislamiento —las que le preguntan a la base qué puede
 * ver alguien sin sesión— se salteaban en silencio. Una prueba de seguridad que
 * no corre es peor que no tenerla: da la sensación de estar cubierto.
 *
 * Se leen dos archivos, por orden:
 *   .env.local → las claves de Supabase, que ya usa la aplicación.
 *   .env.test  → SOLO las credenciales de la cuenta de prueba (PW_EMAIL y
 *                PW_PASSWORD), separadas a propósito: son de una cuenta
 *                descartable y no tienen por qué mezclarse con las de la app.
 *
 * Los dos están ignorados por git (`.env*`), así que nunca se suben.
 * Lo que ya esté definido en la terminal manda sobre los archivos.
 */
for (const archivo of [".env.local", ".env.test"]) {
  if (!existsSync(archivo)) continue;
  for (const linea of readFileSync(archivo, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

/**
 * Pruebas automáticas de los flujos críticos.
 *
 * Todo gratuito: Playwright es de código abierto y corre local o en GitHub
 * Actions. No depende de ningún servicio pago.
 *
 * SE PRUEBA CONTRA EL BUILD DE PRODUCCIÓN, no contra el servidor de desarrollo.
 * Dos motivos, los dos aprendidos a la mala:
 *
 * 1. El servidor de desarrollo compila cada página la primera vez que se la
 *    pide. Con varias pruebas en paralelo esas compilaciones se pisaban y la
 *    suite fallaba de a ratos — ruido que enseña a ignorar los avisos.
 * 2. Más importante: el modo desarrollo NO es lo que ve la gente. Probar ahí
 *    deja pasar cualquier problema que aparezca solo al compilar.
 *
 * Corre en el puerto 3100 para no chocar con un `npm run dev` abierto.
 */
const PUERTO = 3100;
const baseURL = process.env.PW_BASE_URL ?? `http://localhost:${PUERTO}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Un reintento también en local. El servidor de desarrollo compila cada
  // página la primera vez que alguien la pide, y con varias pruebas en
  // paralelo esa primera compilación puede pasarse del tiempo límite. Es un
  // fallo del entorno, no del sitio: al segundo intento la página ya está
  // compilada. Sin esto, la suite falla de a ratos y se vuelve ruido.
  retries: 1,
  /**
   * Menos trabajadores en paralelo de los que Playwright elegiría solo.
   *
   * Por defecto usa uno por núcleo (acá, ocho). Cada prueba abre páginas que
   * consultan la base, y esa base está a unos 250 ms de ida y vuelta: ocho a la
   * vez saturaban el servidor local y alguna prueba distinta agotaba el tiempo
   * en cada corrida. No fallaba nunca lo mismo, que es la señal de que el
   * problema no era ninguna prueba en particular.
   *
   * Con cuatro, la suite tarda casi igual y deja de dar falsas alarmas. Una
   * suite que falla de a ratos enseña a ignorar los avisos, y ahí se pierde
   * todo el valor de tenerla.
   */
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,

  use: {
    baseURL,
    trace: "on-first-retry",
    // Margen para esa primera compilación.
    navigationTimeout: 30_000,
    // La intro de bienvenida se saltea para que no tape la pantalla.
    storageState: { cookies: [], origins: [{ origin: baseURL, localStorage: [] }] },
  },

  projects: [
    // El grueso de la suite, en paralelo, en los dos tamaños de pantalla.
    // Se excluye la prueba de suspensión: ver abajo por qué.
    {
      name: "escritorio",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /suspension\.spec\.ts/,
    },
    {
      name: "celular",
      use: { ...devices["Pixel 7"] },
      // El panel se prueba en un solo tamaño: lo que se verifica ahí es que la
      // función ande (crear, listar, borrar), no cómo se ve. Correrlo en los
      // dos duplicaba las sesiones simultáneas sobre la MISMA cuenta de prueba
      // y la página del panel llegaba a agotar el tiempo — no por un fallo del
      // sitio, sino por seis sesiones peleando por la misma cuenta contra una
      // base que está a 250 ms. Lo específico de celular (tamaño de letra en
      // los campos, desborde horizontal) se cubre en otras pruebas.
      testIgnore: /(suspension|panel)\.spec\.ts/,
    },
    /**
     * La prueba de suspensión corre SOLA y AL FINAL.
     *
     * Suspende temporalmente la cuenta de prueba para comprobar que pierda el
     * acceso de verdad. Pero esa cuenta es la misma que usan las pruebas del
     * panel — y mientras está suspendida, sus escrituras se rechazan, que es
     * exactamente lo que debe pasar.
     *
     * Corriendo en paralelo, las del panel fallaban de a ratos por culpa de
     * esta: no era un fallo del sitio, era que dos pruebas se pisaban usando
     * la misma cuenta. `dependencies` la deja para el final, cuando ya no hay
     * nadie más usándola.
     */
    {
      name: "seguridad",
      testMatch: /suspension\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["escritorio", "celular"],
    },
  ],

  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PUERTO}`,
        url: `http://localhost:${PUERTO}`,
        reuseExistingServer: true,
        // El build tarda; sin margen suficiente la suite falla antes de empezar.
        timeout: 300_000,
      },
});
