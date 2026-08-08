/**
 * RESPALDO COMPLETO de Cursemos Ingeniería.
 *
 * Se ejecuta a mano, desde tu computadora:
 *
 *     npm run respaldo
 *
 * Deja una carpeta con fecha dentro de `respaldos/` que contiene todo el
 * contenido de la base en JSON y todas las fotos de los embajadores.
 *
 * POR QUÉ EXISTE
 * El plan gratuito de Supabase NO hace copias de seguridad automáticas. Si el
 * proyecto se borra por error, si alguien vacía una tabla, o si una migración
 * sale mal, no hay nada a qué volver. Eso es tolerable con contenido de prueba;
 * deja de serlo apenas los embajadores empiecen a cargar su trabajo real.
 *
 * Esto no reemplaza a un respaldo automático del proveedor, pero cubre el caso
 * que importa: que el trabajo de la gente no dependa de que nada salga mal
 * nunca. Correlo antes de cada migración y una vez por semana.
 *
 * SEGURIDAD: usa la clave de administración, así que el archivo resultante
 * contiene TODO, incluidos los datos de contacto. La carpeta `respaldos/` está
 * excluida del repositorio; no la subas a ningún lado público.
 */
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().split(/\s+/)[0];
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().split(/\s+/)[0];

if (!url || !key) {
  console.error(
    "Faltan las claves. Corré con: node --env-file=.env.local scripts/respaldo.mjs",
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

/** Todo lo que hay que poder recuperar. */
const TABLAS = [
  "universities",
  "profiles",
  "ambassador_profiles",
  "news",
  "opportunities",
  "professors",
  "drives",
];

/** Se respalda aparte: crece sin límite y no es contenido, es medición. */
const MEDICION = ["click_events"];

const sello = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const destino = path.join(process.cwd(), "respaldos", sello);

/** Trae una tabla entera, de a tandas: no importa cuánto haya crecido. */
async function traerTodo(tabla) {
  const TANDA = 1000;
  const filas = [];
  for (let desde = 0; ; desde += TANDA) {
    const { data, error } = await db.from(tabla).select("*").range(desde, desde + TANDA - 1);
    if (error) throw new Error(`${tabla}: ${error.message}`);
    filas.push(...(data ?? []));
    if (!data || data.length < TANDA) break;
  }
  return filas;
}

async function main() {
  await mkdir(destino, { recursive: true });
  console.log(`Respaldo → respaldos/${sello}\n`);

  const resumen = {};

  for (const tabla of [...TABLAS, ...MEDICION]) {
    try {
      const filas = await traerTodo(tabla);
      await writeFile(
        path.join(destino, `${tabla}.json`),
        JSON.stringify(filas, null, 2),
        "utf8",
      );
      resumen[tabla] = filas.length;
      console.log(`  ✓ ${tabla.padEnd(22)} ${filas.length} filas`);
    } catch (e) {
      resumen[tabla] = `ERROR: ${e.message}`;
      console.error(`  ✗ ${tabla.padEnd(22)} ${e.message}`);
    }
  }

  // ---- Fotos de embajadores ----
  // Sin esto, restaurar la base dejaría los perfiles con las imágenes rotas.
  console.log("");
  const fotos = [];
  try {
    const { data: carpetas } = await db.storage.from("ambassadors").list("", { limit: 1000 });
    for (const carpeta of carpetas ?? []) {
      // Las fotos viven en una carpeta por universidad.
      const { data: archivos } = await db.storage
        .from("ambassadors")
        .list(carpeta.name, { limit: 1000 });
      for (const a of archivos ?? []) {
        const ruta = `${carpeta.name}/${a.name}`;
        const { data: blob, error } = await db.storage.from("ambassadors").download(ruta);
        if (error || !blob) continue;
        const salida = path.join(destino, "fotos", carpeta.name);
        await mkdir(salida, { recursive: true });
        await writeFile(path.join(salida, a.name), Buffer.from(await blob.arrayBuffer()));
        fotos.push(ruta);
      }
    }
    console.log(`  ✓ fotos                  ${fotos.length} archivos`);
  } catch (e) {
    console.error(`  ✗ fotos: ${e.message}`);
  }

  await writeFile(
    path.join(destino, "_resumen.json"),
    JSON.stringify({ fecha: new Date().toISOString(), tablas: resumen, fotos }, null, 2),
    "utf8",
  );

  console.log(`\nListo. Guardá esta carpeta en algún lado que no sea esta computadora.`);
}

main().catch((e) => {
  console.error("\nEl respaldo FALLÓ:", e.message);
  process.exit(1);
});
