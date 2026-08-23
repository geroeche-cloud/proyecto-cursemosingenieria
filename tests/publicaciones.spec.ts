import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Las páginas propias de las publicaciones.
 *
 * Cada noticia y cada convocatoria tiene su dirección
 * (/campus/<uni>/noticia/<id> y /campus/<uni>/oportunidad/<id>). De estas
 * páginas dependen dos cosas que no se ven al navegar: la vista previa al
 * compartir por WhatsApp (los metadatos) y la entrada propia en Google. Si se
 * rompen, el sitio se sigue viendo perfecto — por eso hay pruebas.
 */

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().split(/\s+/)[0];
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().split(/\s+/)[0];

test.skip(!url || !anon, "Sin claves de Supabase no se puede buscar una publicación real.");

type Pub = { id: string; title: string; slug: string };

/** Una publicación publicada real, con el slug de su universidad. */
async function unaPublicacion(tabla: "news" | "opportunities"): Promise<Pub | null> {
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data } = await supabase
    .from(tabla)
    .select("id, title, universities(slug, status)")
    .eq("status", "published")
    .limit(10);

  for (const fila of (data ?? []) as {
    id: string;
    title: string;
    universities: { slug: string; status: string } | { slug: string; status: string }[] | null;
  }[]) {
    const u = Array.isArray(fila.universities) ? fila.universities[0] : fila.universities;
    if (u?.status === "active") return { id: fila.id, title: fila.title, slug: u.slug };
  }
  return null;
}

async function sinIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ei-intro", "1");
    } catch {}
  });
}

test("una noticia tiene página propia con su título y sus metadatos", async ({ page }) => {
  const pub = await unaPublicacion("news");
  test.skip(!pub, "No hay ninguna noticia publicada para probar.");

  await sinIntro(page);
  const res = await page.goto(`/campus/${pub!.slug}/noticia/${pub!.id}`);
  expect(res?.status()).toBe(200);

  // El título de la publicación, visible y en los metadatos de compartir.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(pub!.title);
  const og = await page.locator('meta[property="og:title"]').getAttribute("content");
  expect(og, "el og:title no habla de esta noticia").toContain(pub!.title);

  // La dirección canónica es la de la publicación, no la del sitio.
  const canonica = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonica).toContain(`/noticia/${pub!.id}`);

  // Y su miniatura propia existe y es una imagen.
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogImage, "la noticia no declara imagen de vista previa").toBeTruthy();
  const img = await page.request.get(ogImage!);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");
});

test("una convocatoria tiene página propia con su título y sus metadatos", async ({ page }) => {
  const pub = await unaPublicacion("opportunities");
  test.skip(!pub, "No hay ninguna convocatoria publicada para probar.");

  await sinIntro(page);
  const res = await page.goto(`/campus/${pub!.slug}/oportunidad/${pub!.id}`);
  expect(res?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(pub!.title);
  const og = await page.locator('meta[property="og:title"]').getAttribute("content");
  expect(og, "el og:title no habla de esta convocatoria").toContain(pub!.title);

  // La miniatura se comprueba acá y no solo en la de noticias: si todavía no
  // hay noticias publicadas, aquella prueba se saltea y la generación de
  // imágenes quedaría sin ejercitar en toda la suite.
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogImage, "la convocatoria no declara imagen de vista previa").toBeTruthy();
  const img = await page.request.get(ogImage!);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");
});

test("el campus enlaza a la página de cada publicación", async ({ page }) => {
  const pub = (await unaPublicacion("news")) ?? (await unaPublicacion("opportunities"));
  test.skip(!pub, "No hay publicaciones para probar.");

  await sinIntro(page);
  await page.goto(`/campus/${pub!.slug}`);
  // Google llega caminando por enlaces reales: tiene que haber al menos uno.
  const enlaces = page.locator(`a[href*="/${pub!.id}"]`);
  await expect(enlaces.first()).toBeAttached({ timeout: 15_000 });
});

test("un identificador inventado da 404, no una página rota", async ({ page }) => {
  // Cualquiera puede escribir esta dirección a mano. Postgres no responde
  // "no existe" ante un id malformado: responde un error de tipo. Si eso
  // llegara a la página, sería un error 500 — el sitio "roto" para un
  // rastreador o un curioso.
  const pub = await unaPublicacion("news");
  const slug = pub?.slug ?? "unco";

  await sinIntro(page);
  for (const ruta of [
    `/campus/${slug}/noticia/cualquier-cosa`,
    `/campus/${slug}/noticia/00000000-0000-0000-0000-000000000000`,
    `/campus/${slug}/oportunidad/tampoco-es-uuid`,
  ]) {
    const res = await page.goto(ruta);
    expect(res?.status(), `${ruta} debería ser 404`).toBe(404);
  }
});

test("las publicaciones vigentes figuran en el mapa del sitio", async ({ page }) => {
  const pub = await unaPublicacion("news");
  test.skip(!pub, "No hay ninguna noticia publicada para probar.");

  const res = await page.goto("/sitemap.xml");
  expect(res?.status()).toBe(200);
  const xml = await res!.text();
  // Si la noticia está vigente tiene que figurar; si el mapa no menciona
  // ninguna ruta de noticia, la sección entera quedó fuera.
  expect(xml).toContain("/noticia/");
});
