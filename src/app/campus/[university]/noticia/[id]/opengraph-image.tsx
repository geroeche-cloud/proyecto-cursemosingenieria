import { tarjetaOg, TAMANO_OG } from "@/lib/og";
import { cargarNoticia } from "@/lib/publicaciones";
import { fechaLarga } from "@/lib/schedule";

/** Miniatura de la noticia para WhatsApp, LinkedIn y demás. */

export const size = TAMANO_OG;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ university: string; id: string }>;
}) {
  const { university, id } = await params;
  const datos = await cargarNoticia(university, id);

  if (!datos) {
    return tarjetaOg({
      tipo: "Noticia",
      titulo: "Esta publicación ya no está disponible",
      pie: "cursemosingenieria.com",
    });
  }

  const { uni, item } = datos;
  return tarjetaOg({
    tipo: "Noticia",
    titulo: item.title,
    pie: [uni.short_name || uni.name, item.published_at ? fechaLarga(item.published_at) : null]
      .filter(Boolean)
      .join("  ·  "),
  });
}
