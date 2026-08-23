import { ImageResponse } from "next/og";

/**
 * La imagen que se ve al compartir una publicación.
 *
 * Hasta acá todo el sitio compartía la misma placa con el logo. En un grupo de
 * WhatsApp esa imagen no distingue una beca de una noticia ni dice de qué
 * universidad es: el recuadro se ve igual siempre, y termina ignorándose.
 * Acá se dibuja una por publicación, con su título.
 *
 * EL DISEÑO CITA A LAS PLACAS DE UNIVERSIDAD del campus, a propósito: la misma
 * trama técnica de fondo, la luz ambiental, el guiño a la red de nodos y la
 * franja de acento. Así el mensaje de WhatsApp y la página a la que lleva se
 * reconocen como la misma cosa. Cuando la publicación está cerrada, el acento
 * pasa de azul a ámbar — el mismo código de color que usan el sitio y el panel.
 *
 * DOS LÍMITES DE ESTA HERRAMIENTA, porque no son obvios y se pagan con una
 * imagen rota en vez de un error visible:
 *   · Solo entiende flexbox y degradados. Nada de grid ni de máscaras, y todo
 *     contenedor con más de un hijo necesita `display: flex` escrito a mano.
 *     Por eso la trama y las luces son capas absolutas apiladas, no un mask.
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
  // Azul eléctrico de la marca; ámbar cuando la publicación ya cerró.
  const acento = cerrada
    ? { fuerte: "#f0b45a", claro: "#ffd9a0", glow: "240,180,90", texto: "#f0b45a" }
    : { fuerte: "#4d8dff", claro: "#8fb4ff", glow: "77,141,255", texto: "#8fb4ff" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(158deg, #131b2e 0%, #0b1020 58%, #090d18 100%)",
        }}
      >
        {/* Luz ambiental arriba a la izquierda, como en las placas del campus */}
        <div
          style={{
            position: "absolute",
            left: -180,
            top: -260,
            width: 720,
            height: 720,
            background: `radial-gradient(circle, rgba(${acento.glow},0.30) 0%, rgba(${acento.glow},0.10) 45%, rgba(${acento.glow},0) 70%)`,
          }}
        />
        {/* Segunda luz, tenue, abajo a la derecha: equilibra sin competir */}
        <div
          style={{
            position: "absolute",
            right: -220,
            bottom: -300,
            width: 680,
            height: 680,
            background: `radial-gradient(circle, rgba(${acento.glow},0.14) 0%, rgba(${acento.glow},0) 65%)`,
          }}
        />

        {/* Trama técnica: dos capas de líneas (vertical + horizontal) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(90deg, rgba(156,182,255,0.09) 2px, transparent 2px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "linear-gradient(rgba(156,182,255,0.09) 2px, transparent 2px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* La trama se desvanece hacia abajo, como en las placas (allá es una
            máscara; acá, que no hay máscaras, es un degradado que la tapa). */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(11,16,32,0) 0%, rgba(11,16,32,0.55) 55%, rgba(9,13,24,0.92) 100%)",
          }}
        />

        {/* Red de nodos: el guiño a la marca, grande y sutil a la derecha */}
        <svg
          viewBox="0 0 64 64"
          width="380"
          height="380"
          style={{ position: "absolute", right: -70, top: 24 }}
        >
          <path
            d="M8 40 L28 18 L56 30"
            stroke={`rgba(${acento.glow},0.40)`}
            strokeWidth="0.7"
            fill="none"
          />
          <path
            d="M28 18 L34 52"
            stroke={`rgba(${acento.glow},0.25)`}
            strokeWidth="0.7"
            fill="none"
          />
          <path
            d="M28 18 L46 4"
            stroke={`rgba(${acento.glow},0.20)`}
            strokeWidth="0.7"
            fill="none"
          />
          <circle cx="28" cy="18" r="2.4" fill={acento.fuerte} />
          <circle cx="8" cy="40" r="1.4" fill={`rgba(${acento.glow},0.75)`} />
          <circle cx="56" cy="30" r="1.4" fill={`rgba(${acento.glow},0.75)`} />
          <circle cx="34" cy="52" r="1.4" fill={`rgba(${acento.glow},0.65)`} />
          <circle cx="46" cy="4" r="1.2" fill={`rgba(${acento.glow},0.55)`} />
        </svg>

        {/* Franja de acento superior, la firma de las placas */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: `linear-gradient(90deg, ${acento.fuerte} 0%, ${acento.claro} 45%, rgba(${acento.glow},0) 90%)`,
          }}
        />

        {/* ---- Contenido ---- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px 56px",
            color: "#e8ecf6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 6,
                background: `linear-gradient(90deg, ${acento.fuerte}, ${acento.claro})`,
                borderRadius: 999,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: acento.texto,
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
              // El título no se cruza con la red de nodos de la derecha.
              maxWidth: 870,
            }}
          >
            {titulo}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid rgba(255,255,255,0.14)",
              paddingTop: 26,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* El punto "en vivo" de las placas; gris cuando cerró */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: cerrada ? "rgba(159,176,208,0.5)" : acento.fuerte,
                }}
              />
              <div style={{ display: "flex", fontSize: 30, color: "#c6d2ea" }}>{pie}</div>
            </div>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#7387ab" }}>
              CURSEMOS INGENIERÍA
            </div>
          </div>
        </div>
      </div>
    ),
    TAMANO_OG,
  );
}
