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
