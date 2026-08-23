import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * El orden del campus.
 *
 * La regla es: primero las destacadas (columna `orden`, menor va antes) y, a
 * igualdad, la que se sumó antes (`created_at`). La universidad fundadora tiene
 * orden 0, así que encabeza siempre.
 *
 * POR QUÉ SE PRUEBA
 * Es un orden que se rompe en silencio. Nadie recibe un error si una consulta
 * nueva se olvida el `.order("orden")`: la página carga bien, se ve bien, y
 * simplemente muestra otra universidad primero. Sin esta prueba, el día que
 * pase nos enteramos porque alguien lo nota a ojo.
 *
 * Lo que se compara es el sitio contra la BASE, no contra una lista escrita
 * acá. Si mañana se suman veinte universidades, la prueba sigue valiendo sola.
 */

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().split(/\s+/)[0];
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().split(/\s+/)[0];

test.skip(!url || !anon, "Sin claves de Supabase no se puede saber qué orden se espera.");

async function ordenEsperado(): Promise<string[]> {
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("universities")
    .select("slug, orden, created_at")
    .eq("status", "active")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: true });
  return ((data ?? []) as { slug: string }[]).map((u) => u.slug);
}

async function slugsEnPantalla(page: import("@playwright/test").Page): Promise<string[]> {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ei-intro", "1");
    } catch {}
  });
  await page.goto("/campus");
  await expect(page.locator("a.uni-card").first()).toBeVisible({ timeout: 15_000 });
  return (await page.locator("a.uni-card").evaluateAll((links) =>
    links.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""),
  )).map((href) => href.replace("/campus/", ""));
}

test("el campus respeta el orden elegido y después la antigüedad", async ({ page }) => {
  const esperado = await ordenEsperado();
  test.skip(esperado.length < 2, "Con una sola universidad el orden no se puede comprobar.");

  expect(await slugsEnPantalla(page)).toEqual(esperado);
});

test("la universidad destacada encabeza el campus", async ({ page }) => {
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("universities")
    .select("slug, orden")
    .eq("status", "active")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1);

  const primera = (data ?? [])[0] as { slug: string; orden: number } | undefined;
  test.skip(!primera, "No hay universidades activas.");
  test.skip(
    primera!.orden !== 0,
    "Ninguna universidad está marcada como destacada; no hay nada que comprobar.",
  );

  const enPantalla = await slugsEnPantalla(page);
  expect(enPantalla[0], "la destacada dejó de estar primera en el campus").toBe(primera!.slug);
});

test("el orden no cambia entre visitas", async ({ page }) => {
  // Antes el desempate era alfabético: corregirle una letra al nombre de una
  // universidad la movía de lugar. Ahora desempata `created_at`, que no se
  // toca nunca — ni al editar la universidad ni al editar un perfil.
  const primera = await slugsEnPantalla(page);
  test.skip(primera.length < 2, "Con una sola universidad el orden no se puede comprobar.");

  const segunda = await slugsEnPantalla(page);
  expect(segunda, "el campus devolvió otro orden en la segunda visita").toEqual(primera);
});
