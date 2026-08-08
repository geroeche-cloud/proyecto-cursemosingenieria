import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * SUSPENDER TIENE QUE QUITAR EL ACCESO DE VERDAD.
 *
 * Esta es la prueba de seguridad más importante del proyecto, porque cubre el
 * agujero más serio que tuvo: la función que usan todas las políticas leía el
 * rol de la persona SIN mirar si su cuenta estaba suspendida o borrada. El
 * panel la redirigía al login —eso es frontend— pero su token de sesión seguía
 * siendo válido contra la base. Con ese token podía seguir creando, editando y
 * borrando contenido de su universidad desde fuera de la aplicación.
 *
 * La diferencia entre "no ve el botón" y "no puede hacerlo". Solo lo segundo es
 * seguridad, y solo se comprueba haciéndolo.
 *
 * CÓMO FUNCIONA
 * Inicia sesión con la cuenta de prueba, la suspende, verifica que su sesión ya
 * no pueda escribir, y la reactiva. La reactivación está en un `finally`: pase
 * lo que pase, la cuenta queda como estaba.
 *
 * Necesita PW_EMAIL y PW_PASSWORD (cuenta de prueba, no una real).
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

test("una cuenta suspendida pierde el acceso a la base, no solo al panel", async () => {
  const admin = createClient(url, servicio, { auth: { persistSession: false } });

  // Sesión real de la persona, igual que si hubiera entrado al panel.
  const suyo = createClient(url, anon, { auth: { persistSession: false } });
  const { data: sesion, error: errLogin } = await suyo.auth.signInWithPassword({
    email: EMAIL!,
    password: CLAVE!,
  });
  expect(errLogin, "no se pudo iniciar sesión con la cuenta de prueba").toBeNull();
  const id = sesion.user!.id;

  // Con la cuenta activa, tiene que poder escribir en SU universidad.
  const tituloA = `Prueba de suspensión (activa) ${Date.now()}`;
  const alta = await suyo.from("news").insert({ title: tituloA, slug: `sa-${Date.now()}` });
  expect(alta.error, "una cuenta activa debería poder publicar").toBeNull();

  try {
    // ---- Se suspende ----
    const susp = await admin.from("profiles").update({ status: "suspended" }).eq("id", id);
    expect(susp.error).toBeNull();

    // La sesión SIGUE ABIERTA: el token no caducó. Ese es exactamente el caso
    // peligroso — alguien con la pestaña abierta cuando lo suspendieron.
    const tituloB = `Prueba de suspensión (suspendida) ${Date.now()}`;
    const intento = await suyo.from("news").insert({ title: tituloB, slug: `ss-${Date.now()}` });
    expect(
      intento.error,
      "UNA CUENTA SUSPENDIDA PUDO PUBLICAR: falta correr 0014_suspension_real.sql",
    ).not.toBeNull();

    // Tampoco puede borrar lo que había creado antes.
    const borrado = await suyo.from("news").delete().eq("title", tituloA).select();
    expect(
      borrado.data ?? [],
      "una cuenta suspendida pudo BORRAR contenido",
    ).toHaveLength(0);
  } finally {
    // Pase lo que pase, la cuenta vuelve a como estaba.
    await admin.from("profiles").update({ status: "active" }).eq("id", id);
    // Y se limpia lo que creó la prueba.
    await admin.from("news").delete().like("title", "Prueba de suspensión%");
  }

  // Reactivada, vuelve a poder trabajar con normalidad.
  const tituloC = `Prueba de suspensión (reactivada) ${Date.now()}`;
  const otra = await suyo.from("news").insert({ title: tituloC, slug: `sr-${Date.now()}` });
  expect(otra.error, "la cuenta no recuperó el acceso al reactivarla").toBeNull();
  await admin.from("news").delete().like("title", "Prueba de suspensión%");
});
