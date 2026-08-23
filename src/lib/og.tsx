import { ImageResponse } from "next/og";

/**
 * La imagen que se ve al compartir una publicación.
 *
 * Hasta acá todo el sitio compartía la misma placa con el logo. En un grupo de
 * WhatsApp esa imagen no distingue una beca de una noticia ni dice de qué
 * universidad es: el recuadro se ve igual siempre, y termina ignorándose.
 * Acá se dibuja una por publicación, con su título.
 *
 * DOS LÍMITES DE ESTA HERRAMIENTA, porque no son obvios y se pagan con una
 * imagen rota en vez de un error visible:
 *   · Solo entiende flexbox. Nada de grid, y todo contenedor con más de un hijo
 *     necesita `display: flex` escrito a mano.
 *   · No se cargan tipografías propias. Se usa la que trae por defecto, que
 *     cubre acentos y eñes. Sumar los archivos de fuente del proyecto acercaría
 *     peligrosamente al tope de 500 KB por imagen y no cambia lo que la persona
 *     lee en la miniatura.
 */

export const TAMANO_OG = { width: 1200, height: 630 };

/** Títulos largos en cuerpo grande se desbordan; el tamaño se acomoda al texto. */
function cuerpoDelTitulo(titulo: string): number {
  if (titulo.length > 110) return 46;
  if (titulo.length > 70) return 56;
  if (titulo.length > 40) return 68;
  return 78;
}

export function tarjetaOg({
  tipo,
  titulo,
  pie,
  cerrada = false,
}: {
  tipo: string;
  titulo: string;
  pie: string;
  cerrada?: boolean;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)",
          padding: "64px 72px",
          color: "#e8ecf6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 6, background: "#4d8dff", borderRadius: 999 }} />
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: cerrada ? "#f0b45a" : "#8fb4ff",
            }}
          >
            {cerrada ? `${tipo} · cerrada` : tipo}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: cuerpoDelTitulo(titulo),
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -1,
            color: "#ffffff",
          }}
        >
          {titulo}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#9fb0d0" }}>{pie}</div>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#5f7396" }}>
            CURSEMOS INGENIERÍA
          </div>
        </div>
      </div>
    ),
    TAMANO_OG,
  );
}
