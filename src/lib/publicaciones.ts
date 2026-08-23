import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/site";

/**
 * Publicaciones con dirección propia.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * Hasta acá cada noticia y cada convocatoria vivían dentro de la página de su
 * universidad, señaladas con un ancla (`#pub-<id>`). Eso alcanza para saltar al
 * lugar correcto, pero un ancla NO es una dirección: para Google todas las
 * publicaciones de una universidad son la misma página, así que ninguna puede
 * aparecer sola en una búsqueda; y al compartirla por WhatsApp la vista previa
 * es la del sitio entero, sin decir de qué se trata.
 *
 * Con una dirección propia cada publicación gana las tres cosas que le
 * faltaban: entrada propia en el buscador, vista previa con su título y su
 * descripción, y una página que puede explicar que la convocatoria ya cerró en
 * vez de dejar al visitante mirando una lista donde no está.
 */

export const KIND_LABEL: Record<string, string> = {
  beca: "Beca",
  pasantia: "Pasantía",
  programa: "Programa",
  evento: "Evento",
  competencia: "Competencia",
  noticia: "Noticia",
};

/**
 * Los identificadores son UUID. Se comprueba la forma ANTES de consultar
 * porque Postgres no responde "no existe" ante un id con formato inválido:
 * responde un error de tipo. Sin este filtro, `/campus/unco/noticia/hola`
 * sería una página rota (error 500) en vez de un 404 honesto — y es una
 * dirección que cualquiera puede escribir a mano o un rastreador inventar.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function esId(valor: string): boolean {
  return UUID.test(valor);
}

export const rutaNoticia = (slug: string, id: string) => `/campus/${slug}/noticia/${id}`;
export const rutaOportunidad = (slug: string, id: string) => `/campus/${slug}/oportunidad/${id}`;
export const urlAbsoluta = (ruta: string) => `${SITE_URL}${ruta}`;

/**
 * Recorta un texto para una vista previa.
 *
 * WhatsApp, LinkedIn y Google muestran alrededor de 160 caracteres y cortan el
 * resto sin avisar. Cortar acá, en un espacio y con puntos suspensivos, se lee
 * mejor que una frase que termina en la mitad de una palabra.
 */
export function recorte(texto: string | null | undefined, max = 155): string {
  const limpio = (texto ?? "").replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const cortado = limpio.slice(0, max);
  const ultimoEspacio = cortado.lastIndexOf(" ");
  return `${(ultimoEspacio > max * 0.6 ? cortado.slice(0, ultimoEspacio) : cortado).trim()}…`;
}

export type UniMin = {
  id: string;
  name: string;
  short_name: string | null;
  city: string | null;
  slug: string;
};

export type NoticiaDetalle = {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  published_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  clicks: number | null;
};

export type OportunidadDetalle = {
  id: string;
  kind: string;
  title: string;
  org: string | null;
  description: string | null;
  deadline: string | null;
  requirements: string[] | null;
  href: string | null;
  starts_at: string | null;
  ends_at: string | null;
  clicks: number | null;
};

export type Detalle<T> = { uni: UniMin; item: T };

/**
 * `cache()` de React: la misma publicación se pide dos veces por página —una
 * para los datos de la vista previa (título, descripción) y otra para el
 * contenido—. Sin esto serían dos viajes idénticos a la base por cada visita.
 */
const cargarUniversidad = cache(async (slug: string): Promise<UniMin | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("universities")
    .select("id, name, short_name, city, slug")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  // Un fallo de la base NO es "no existe". Si se confundieran, un hipo momentáneo
  // dejaría la página cacheada como 404 para todo el mundo; lanzando, Next sigue
  // sirviendo la última versión buena. Es la misma decisión que en /campus.
  if (error) throw new Error(`[supabase] universidad ${slug}: ${error.message}`);
  return (data as UniMin | null) ?? null;
});

export const cargarNoticia = cache(
  async (slug: string, id: string): Promise<Detalle<NoticiaDetalle> | null> => {
    if (!esId(id)) return null;
    const uni = await cargarUniversidad(slug);
    if (!uni) return null;

    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("news")
      .select("id, title, summary, body, published_at, starts_at, ends_at, clicks")
      // Se ata a la universidad de la dirección: no alcanza con que el id
      // exista, tiene que ser de ESTA universidad. Si no, la noticia de una
      // universidad sería alcanzable desde la dirección de cualquier otra.
      .eq("university_id", uni.id)
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(`[supabase] noticia ${id}: ${error.message}`);
    return data ? { uni, item: data as NoticiaDetalle } : null;
  },
);

export const cargarOportunidad = cache(
  async (slug: string, id: string): Promise<Detalle<OportunidadDetalle> | null> => {
    if (!esId(id)) return null;
    const uni = await cargarUniversidad(slug);
    if (!uni) return null;

    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, kind, title, org, description, deadline, requirements, href, starts_at, ends_at, clicks")
      .eq("university_id", uni.id)
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(`[supabase] oportunidad ${id}: ${error.message}`);
    return data ? { uni, item: data as OportunidadDetalle } : null;
  },
);
