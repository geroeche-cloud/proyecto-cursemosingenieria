import { tarjetaOg, TAMANO_OG } from "@/lib/og";
import { cargarOportunidad, KIND_LABEL } from "@/lib/publicaciones";
import { isActiveNow } from "@/lib/schedule";

/**
 * Miniatura de la convocatoria para WhatsApp, LinkedIn y demás.
 * Next la sirve solo y la referencia desde los metadatos de la página.
 */

export const size = TAMANO_OG;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ university: string; id: string }>;
}) {
  const { university, id } = await params;
  const datos = await cargarOportunidad(university, id);

  // Sin datos (borrada, despublicada) igual se dibuja algo digno: la miniatura
  // puede pedirse para un enlace viejo que sigue circulando.
  if (!datos) {
    return tarjetaOg({
      tipo: "Convocatoria",
      titulo: "Esta publicación ya no está disponible",
      pie: "cursemosingenieria.com",
    });
  }

  const { uni, item } = datos;
  return tarjetaOg({
    tipo: KIND_LABEL[item.kind] ?? item.kind,
    titulo: item.title,
    pie: [uni.short_name || uni.name, item.deadline ? `Cierre: ${item.deadline}` : null]
      .filter(Boolean)
      .join("  ·  "),
    cerrada: !isActiveNow(item.starts_at, item.ends_at),
  });
}
