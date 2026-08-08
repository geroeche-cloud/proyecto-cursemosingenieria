/**
 * Validación de lo que se carga desde los formularios.
 *
 * TODO ACÁ CORRE EN EL SERVIDOR. Las validaciones del navegador son una
 * cortesía para quien escribe: se saltean con dos clics en las herramientas de
 * desarrollo, o mandando el formulario a mano. La única validación que cuenta
 * es la del servidor, y es esta.
 *
 * POR QUÉ HACE FALTA
 * Antes solo se comprobaba que los campos obligatorios no estuvieran vacíos.
 * Nada impedía guardar un título de medio megabyte, y esa publicación después
 * se sirve en la página pública de la universidad —que está cacheada y se le
 * entrega a TODOS los visitantes—. Un solo campo mal cargado podía inflar una
 * página que ven miles de personas.
 *
 * Tampoco se miraban las fechas: se podía publicar algo con fecha de fin
 * anterior a la de inicio, o sea nacido vencido, sin ningún aviso.
 *
 * CÓMO SE USA
 * Los validadores lanzan un error con el mensaje ya escrito en castellano. Las
 * acciones ya tienen un `catch` que lo convierte en el mensaje que ve la
 * persona, así que no hace falta cambiar nada más.
 *
 * CÓMO SE EXTIENDE
 * Un módulo de contenido nuevo (eventos, recursos, lo que venga) declara sus
 * límites en LIMITES y usa estos mismos validadores. No hay que volver a
 * escribir reglas ni acordarse de nada.
 */

/** Longitudes máximas por campo. Un solo lugar para revisarlas y ajustarlas. */
export const LIMITES = {
  titulo: 160,
  resumen: 300,
  cuerpo: 8000,
  organizacion: 120,
  descripcion: 4000,
  nombre: 120,
  cargo: 120,
  whatsapp: 32,
  carrera: 120,
  enlace: 600,
  /** Listas: cuántos elementos y cuánto mide cada uno. */
  materias: { items: 30, largo: 80 },
  requisitos: { items: 25, largo: 240 },
  /** Perfil del embajador. */
  bioCorta: 240,
  bioLarga: 4000,
  presentacion: 200,
} as const;

/**
 * ¿Es un carácter invisible que conviene descartar?
 *
 * Se filtra por código numérico en vez de con una expresión regular: son
 * caracteres que no se ven, y escribirlos literalmente en el código los vuelve
 * imposibles de revisar. Así queda explícito qué se saca y por qué.
 */
function esInvisible(c: number): boolean {
  // De control (0–31), salvo tabulación (9), salto de línea (10) y retorno (13).
  if (c < 32 && c !== 9 && c !== 10 && c !== 13) return true;
  if (c === 127) return true; // suprimir

  // 0x200B: espacio de ancho cero. No se ve y sirve para inflar textos o
  // partir palabras de forma invisible. Fuera.
  if (c === 0x200b) return true;

  // OJO: 0x200C y 0x200D (no-unión y UNIÓN de ancho cero) NO se tocan.
  // El 0x200D es el que pega los emojis compuestos: 👨‍🔬 es literalmente
  // 👨 + unión + 🔬. Borrarlo rompe el emoji y deja dos dibujos sueltos.
  // También los usan varios idiomas para formar palabras. Son texto real.

  // Marcas y cambios de dirección del texto. Estos SÍ son peligrosos: permiten
  // que lo que se muestra en pantalla diga algo distinto de lo que está
  // guardado (por ejemplo, disfrazar la extensión de un archivo).
  if (c === 0x200e || c === 0x200f) return true;
  if (c >= 0x2028 && c <= 0x202e) return true;
  if (c >= 0x2066 && c <= 0x2069) return true;

  if (c === 0xfeff) return true; // marca de orden de bytes
  return false;
}

/**
 * Limpia un texto antes de medirlo o guardarlo.
 *
 * Saca los caracteres invisibles —no se ven, nadie los escribe a propósito, y
 * sirven para dar vuelta el orden del texto en pantalla o disfrazar
 * contenido— y recorta los espacios de los extremos.
 *
 * Los emojis y los acentos NO se tocan: son texto válido y la gente los usa.
 * Por eso se recorre por punto de código y no por posición: un emoji ocupa dos
 * posiciones y partirlo al medio lo rompería.
 */
export function limpiar(valor: unknown): string {
  let salida = "";
  for (const ch of String(valor ?? "")) {
    const c = ch.codePointAt(0);
    if (c === undefined || !esInvisible(c)) salida += ch;
  }
  return salida.trim();
}

/**
 * Texto de un formulario, validado.
 *
 * @param obligatorio Si es true y queda vacío, se rechaza.
 * @returns El texto limpio, o null si quedó vacío y no era obligatorio.
 */
export function texto(
  valor: unknown,
  campo: string,
  max: number,
  obligatorio = false,
): string | null {
  const v = limpiar(valor);

  if (!v) {
    if (obligatorio) throw new Error(`${campo} no puede quedar vacío.`);
    return null;
  }

  // Se mide en caracteres tal como los cuenta el navegador. Un emoji puede
  // contar como dos: el límite queda un poco más estricto para ellos, que es
  // el lado seguro por el que equivocarse.
  if (v.length > max) {
    throw new Error(
      `${campo} es demasiado largo: ${v.length} caracteres, el máximo es ${max}.`,
    );
  }

  return v;
}

/** Fecha de un formulario (aaaa-mm-dd o ISO). Null si viene vacía. */
export function fecha(valor: unknown, campo: string): string | null {
  const v = limpiar(valor);
  if (!v) return null;

  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`${campo} no es una fecha válida.`);
  }

  // Cota de cordura: descarta errores de tipeo como el año 20026, que después
  // rompen los cálculos de vigencia y los ordenamientos.
  const anio = d.getUTCFullYear();
  if (anio < 2000 || anio > 2100) {
    throw new Error(`${campo} tiene un año fuera de lo razonable (${anio}).`);
  }

  return v;
}

/**
 * Rango de vigencia de una publicación.
 *
 * Sin esto se podía publicar algo con fin anterior al inicio: nacía vencido y
 * no aparecía nunca, sin que nadie entendiera por qué.
 */
export function rangoDeFechas(desde: string | null, hasta: string | null): void {
  if (!desde || !hasta) return;
  if (new Date(hasta).getTime() < new Date(desde).getTime()) {
    throw new Error(
      "La fecha de fin es anterior a la de inicio: la publicación no se vería nunca.",
    );
  }
}

/**
 * Lista escrita una por línea (materias, requisitos).
 * Se descartan las líneas vacías y se validan cantidad y largo de cada una.
 */
export function lista(
  valor: unknown,
  campo: string,
  limite: { items: number; largo: number },
): string[] {
  const items = limpiar(valor)
    .split("\n")
    .map((s) => limpiar(s))
    .filter(Boolean);

  if (items.length > limite.items) {
    throw new Error(`${campo}: son demasiados (${items.length}), el máximo es ${limite.items}.`);
  }
  const largo = items.find((s) => s.length > limite.largo);
  if (largo) {
    throw new Error(
      `${campo}: "${largo.slice(0, 30)}…" es demasiado largo (máximo ${limite.largo} caracteres).`,
    );
  }
  return items;
}

/** Uno de los valores permitidos. Cierra la puerta a enviar cualquier cosa. */
export function opcion<T extends string>(valor: unknown, campo: string, validos: readonly T[]): T {
  const v = limpiar(valor) as T;
  if (!validos.includes(v)) {
    throw new Error(`${campo} no es un valor válido.`);
  }
  return v;
}
