import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * UN EMBAJADOR NO PUEDE VER CONTENIDO DE OTRA UNIVERSIDAD.
 *
 * Esta prueba nace de un incidente real: al sumar una embajadora nueva, su
 * panel le mostraba las publicaciones de otra universidad.
 *
 * La causa fue sutil y vale registrarla. La política de lectura decía
 * "lo publicado lo ve cualquiera", que es imprescindible para el sitio público
 * — sin eso un visitante anónimo no vería nada. Pero también alcanzaba a una
 * sesión iniciada, y el panel consultaba la tabla entera confiando en que la
 * base filtrara. La base hacía lo que le habían pedido; el panel pedía mal.
 *
 * Se comprueba con la sesión REAL de un embajador contra la base, no mirando
 * la pantalla: es la única forma de saber qué puede leer de verdad.
 */

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().split(/\s+/)[0];
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().split(/\s+/)[0];
const servicio = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().split(/\s+/)[0];
const EMAIL = process.env.PW_EMAIL;
const CLAVE = process.env.PW_PASSWORD;

test.skip(
  !url || !anon || !servicio || !EMAIL || !CLAVE,
  "Necesita las claves de Supabase y una cuenta de prueba (PW_EMAIL / PW_PASSWORD).",
);

const TABLAS = ["news", "opportunities", "professors", "drives"] as const;

test("un embajador solo lee contenido de SU universidad", async () => {
  const admin = createClient(url, servicio, { auth: { persistSession: false } });

  // Sesión real, igual que si hubiera entrado al panel.
  const suyo = createClient(url, anon, { auth: { persistSession: false } });
  const { data: sesion, error } = await suyo.auth.signInWithPassword({
    email: EMAIL!,
    password: CLAVE!,
  });
  expect(error, "no se pudo iniciar sesión con la cuenta de prueba").toBeNull();

  const { data: perfil } = await admin
    .from("profiles")
    .select("university_id, status")
    .eq("id", sesion.user!.id)
    .single();

  expect(
    perfil?.status,
    `La cuenta de prueba (${EMAIL}) está ${perfil?.status}. Reactivala o usá otra.`,
  ).toBe("active");

  const miUni = perfil!.university_id as string;

  // Tiene que existir contenido de OTRA universidad, si no la prueba no prueba nada.
  const { count: ajenas } = await admin
    .from("universities")
    .select("id", { count: "exact", head: true })
    .neq("id", miUni);
  test.skip(!ajenas, "Hace falta más de una universidad para comprobar el aislamiento.");

  for (const tabla of TABLAS) {
    const { data } = await suyo.from(tabla).select("university_id").limit(500);
    const ajeno = (data ?? []).filter((r) => r.university_id !== miUni);
    expect(
      ajeno.length,
      `${tabla}: la sesión ve ${ajeno.length} filas de OTRA universidad. ` +
        "Falta correr 0016_lectura_por_universidad.sql, o una consulta del panel " +
        "no filtra por universidad.",
    ).toBe(0);
  }
});

test("el sitio público SÍ ve lo publicado de todas las universidades", async () => {
  // La contracara: al cerrar la lectura por universidad, el sitio público no
  // debe quedar vacío. Usa el cliente sin sesión, como un visitante.
  const publico = createClient(url, anon, { auth: { persistSession: false } });
  const admin = createClient(url, servicio, { auth: { persistSession: false } });

  const { count: publicadas } = await admin
    .from("professors")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .is("deleted_at", null);
  test.skip(!publicadas, "No hay profesores publicados para comprobarlo.");

  const { data } = await publico.from("professors").select("id, status").limit(200);
  expect((data ?? []).length, "el visitante anónimo dejó de ver el contenido público").toBeGreaterThan(0);
  expect((data ?? []).every((r) => r.status === "published")).toBe(true);
});
