import { urlSegura } from "@/lib/url";
import { limpiar } from "@/lib/validar";

/**
 * Convierte lo que una persona escribe en el enlace real de su red social.
 *
 * POR QUÉ EXISTE
 * El formulario pedía la URL completa de cada red. Pero nadie te pasa
 * "https://instagram.com/juanperez": te pasa "@juanperez", o "juanperez", o
 * copia la barra de direcciones con veinte parámetros de seguimiento pegados.
 *
 * Cargar un embajador significaba armar cuatro URLs a mano. Multiplicado por
 * cientos de embajadores, es tiempo perdido en una tarea mecánica — y cada vez
 * una chance de equivocarse en un enlace que después queda publicado.
 *
 * Ahora se acepta cualquiera de esas formas y se guarda siempre la URL limpia.
 */

type Red = "instagram" | "tiktok" | "youtube" | "linkedin";

const BASE: Record<Red, (usuario: string) => string> = {
  instagram: (u) => `https://instagram.com/${u.replace(/^@/, "")}`,
  tiktok: (u) => `https://tiktok.com/@${u.replace(/^@/, "")}`,
  youtube: (u) => `https://youtube.com/@${u.replace(/^@/, "")}`,
  // LinkedIn distingue persona de empresa; sin más datos se asume persona,
  // que es lo que va a ser un embajador el 99% de las veces.
  linkedin: (u) => `https://linkedin.com/in/${u.replace(/^@/, "")}`,
};

/**
 * Parámetros de seguimiento que se pegan al copiar desde una app. No aportan
 * nada, ensucian el enlace y delatan de dónde salió.
 */
const BASURA = /^(utm_|fbclid|gclid|igsh|igshid|si$|_r$|_t$|is_from|share_)/i;

function limpiarParametros(u: URL): URL {
  for (const clave of [...u.searchParams.keys()]) {
    if (BASURA.test(clave)) u.searchParams.delete(clave);
  }
  return u;
}

/**
 * Normaliza el valor de una red social.
 *
 * Acepta:  "@juanperez" · "juanperez" · "instagram.com/juanperez"
 *          "https://www.instagram.com/juanperez?igsh=xxxx"
 * Devuelve siempre una URL limpia, o null si quedó vacío.
 *
 * Si la persona pegó un enlace de OTRO dominio, se respeta tal cual: puede que
 * su portfolio o su canal estén en otro lado y no nos corresponde corregirla.
 */
export function normalizarRed(valor: unknown, red: Red): string | null {
  const v = limpiar(valor);
  if (!v) return null;

  // ¿Ya viene con esquema o con pinta de dominio?
  //
  // El esquema se detecta SIN exigir las dos barras. Un "javascript:alert(1)"
  // no las tiene, y si no se lo trataba como enlace terminaba en la rama de
  // nombre de usuario, que lo rechazaba igual pero avisando "caracteres raros"
  // — un mensaje que no ayuda a entender qué pasó. Así entra por el saneo de
  // enlaces, que descarta todo lo que no sea http, https o mailto.
  const pareceEnlace = /^[a-z][a-z0-9+.-]*:/i.test(v) || /^[\w-]+(\.[\w-]+)+\//.test(v);

  if (pareceEnlace) {
    const seguro = urlSegura(v);
    if (!seguro) return null;
    try {
      // Vale tanto un enlace de la red que corresponde como de otra: puede que
      // su portfolio o su canal estén en otro lado, y no nos toca corregirla.
      const u = limpiarParametros(new URL(seguro));
      return u.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }

  // Es un nombre de usuario suelto: se arma el enlace.
  const usuario = v.replace(/^@/, "").replace(/\s+/g, "");
  if (!/^[\w.\-]{1,64}$/.test(usuario)) {
    throw new Error(
      `El usuario de ${red} tiene caracteres raros. Escribí solo el nombre (por ejemplo @juanperez) o el enlace completo.`,
    );
  }
  return BASE[red](usuario);
}

/** Correo de contacto: se guarda el mail pelado, sin "mailto:". */
export function normalizarMail(valor: unknown): string | null {
  const v = limpiar(valor).replace(/^mailto:/i, "");
  if (!v) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
    throw new Error("El correo no tiene un formato válido.");
  }
  return v.toLowerCase();
}
