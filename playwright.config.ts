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
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,

  use: {
    baseURL,
    trace: "on-first-retry",
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
