import { chromium } from "@playwright/test";
const U = "https://www.cursemosingenieria.com";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const fallas = [];
p.on("pageerror", (e) => fallas.push("JS: " + e.message.slice(0, 120)));
p.on("console", (m) => { if (m.type() === "error") fallas.push("consola: " + m.text().slice(0, 120)); });

await p.goto(U + "/", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);

// Se simula un deploy nuevo: los archivos que la pestaña vieja va a pedir
// para navegar ya no existen en el servidor.
await p.route("**/_next/static/**", (route) => route.fulfill({ status: 404, body: "" }));
await p.route("**/campus?_rsc=*", (route) => route.fulfill({ status: 404, body: "" }));

console.log("simulando deploy nuevo, clic en Campus...");
await p.locator('a[href="/campus"]').first().click();
await p.waitForTimeout(6000);

const d = await p.evaluate(() => ({ url: location.pathname, texto: document.body.innerText.trim().length, tarjetas: document.querySelectorAll('a[href^="/campus/"]').length }));
console.log("  quedo en:", d.url, "· texto:", d.texto, "· tarjetas:", d.tarjetas);
console.log("  resultado:", d.url === "/campus" && d.tarjetas > 0 ? "SE RECUPERO" : "SE QUEDO TRABADO");
console.log("  errores:", fallas.length ? fallas.slice(0,3) : "ninguno");
await b.close();
