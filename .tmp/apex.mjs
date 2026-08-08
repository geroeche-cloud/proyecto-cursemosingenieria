import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const fallas = [];
p.on("pageerror", (e) => fallas.push("JS: " + e.message.slice(0, 130)));
p.on("console", (m) => { if (m.type() === "error") fallas.push("consola: " + m.text().slice(0, 130)); });
p.on("requestfailed", (r) => fallas.push("red FALLA: " + r.url().slice(-70) + " " + (r.failure()?.errorText||"")));

console.log("--- abriendo cursemosingenieria.com (sin www) ---");
await p.goto("https://cursemosingenieria.com/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
console.log("  url final:", p.url());
console.log("  texto:", (await p.evaluate(() => document.body.innerText.trim().length)));

console.log("--- clic en Campus ---");
await p.locator('a[href="/campus"]').first().click();
await p.waitForTimeout(4000);
const d = await p.evaluate(() => ({
  url: location.href,
  texto: document.body.innerText.trim().length,
  tarjetas: document.querySelectorAll('a[href^="/campus/"]').length,
  visible: (document.body.innerText||"").slice(0, 120).replace(/\s+/g," "),
}));
console.log("  url:", d.url);
console.log("  texto:", d.texto, "· tarjetas de universidad:", d.tarjetas);
console.log("  contenido:", d.visible);

console.log("\nerrores:", fallas.length ? fallas : "ninguno");
await b.close();
