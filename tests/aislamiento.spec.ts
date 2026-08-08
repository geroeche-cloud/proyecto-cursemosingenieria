import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Qué puede ver alguien SIN sesión, preguntándole directo a la base.
 *
 * Estas pruebas no pasan por el sitio: usan la clave pública contra Supabase,
 * que es exactamente lo que puede hacer cualquiera —la clave está, por diseño,
 * en el código que se descarga el navegador—. O sea: esto comprueba la
 * seguridad real, no la que se ve en pantalla.
 *
 * Existen porque DOS veces se crearon funciones nuevas y quedaron abiertas al
 * público por olvido. Postgres concede permiso de ejecución a todo el mundo por
 * defecto: hay que quitarlo a propósito, y es un descuido silencioso. Ahora
 * cada corrida lo verifica.
 */

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().split(/\s+/)[0];
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().split(/\s+/)[0];

test.skip(!url || !anon, "Sin claves de Supabase no se puede comprobar el aislamiento.");

const publico = () => createClient(url, anon, { auth: { persistSession: false } });

test("las cuentas de usuario no se pueden leer desde afuera", async () => {
  const { data } = await publico().from("profiles").select("*").limit(50);
  expect(data ?? [], "la tabla de perfiles quedó legible").toHaveLength(0);
});

test("la medición individual no se puede leer desde afuera", async () => {
  // click_events guarda el rastro por visitante. Tiene RLS sin políticas: nadie
  // lo lee, ni siquiera con sesión. Solo entra por la función que registra.
  const { data } = await publico().from("click_events").select("*").limit(50);
  expect(data ?? [], "los eventos de medición quedaron legibles").toHaveLength(0);
});

test("los informes agregados NO son consultables sin sesión", async () => {
  for (const [fn, args] of [
    ["report_stats", { p_uni: null }],
    ["report_by_university", {}],
    ["panel_overview", {}],
    ["admin_overview", {}],
  ] as const) {
    const { error } = await publico().rpc(fn, args as Record<string, unknown>);
    expect(error, `${fn} quedó abierta al público`).not.toBeNull();
  }
});

test("solo se ve contenido publicado, nunca borradores", async () => {
  for (const tabla of ["news", "opportunities", "professors", "drives"] as const) {
    const { data } = await publico().from(tabla).select("status").limit(200);
    const noPublicados = (data ?? []).filter((r) => r.status !== "published");
    expect(noPublicados, `${tabla}: se filtró contenido sin publicar`).toHaveLength(0);
  }
});

test("solo se ven universidades activas", async () => {
  const { data } = await publico().from("universities").select("status").limit(200);
  const inactivas = (data ?? []).filter((u) => u.status !== "active");
  expect(inactivas, "se filtraron universidades inactivas").toHaveLength(0);
});

test("nadie puede escribir sin sesión", async () => {
  const { error } = await publico()
    .from("news")
    .insert({ title: "prueba de intrusión", slug: `x-${Date.now()}` });
  expect(error, "se pudo INSERTAR contenido sin sesión").not.toBeNull();
});
