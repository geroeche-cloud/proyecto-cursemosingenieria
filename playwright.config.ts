import { defineConfig, devices } from "@playwright/test";

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
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
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
