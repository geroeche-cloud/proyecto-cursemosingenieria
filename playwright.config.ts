import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas automáticas de los flujos críticos.
 *
 * Todo gratuito: Playwright es de código abierto y corre local o en GitHub
 * Actions. No depende de ningún servicio pago.
 *
 * Levanta el sitio solo antes de correr las pruebas (`npm run dev`) y lo baja
 * al terminar. Si ya hay uno andando en el 3000, lo reutiliza.
 */
const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3000";

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
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
