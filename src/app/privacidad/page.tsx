import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ORG } from "@/lib/org";
import { fechaLarga } from "@/lib/schedule";

/**
 * Política de privacidad.
 *
 * SERVER COMPONENT: cero JavaScript. Es texto.
 *
 * IMPORTANTE — esto es un BORRADOR TÉCNICO, no un documento legal cerrado.
 * Describe con exactitud qué datos toca el sitio, verificado contra el código y
 * contra la base. Sirve para que quien tenga matrícula revise en vez de
 * investigar desde cero. No debería publicarse como definitivo sin esa revisión.
 *
 * Si mañana se agrega una herramienta que recolecte algo (analítica, chat,
 * publicidad, formularios nuevos), hay que actualizar este archivo. Es la clase
 * de página que envejece en silencio.
 */

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos recolecta Cursemos Ingeniería, para qué los usa y cómo ejercer tus derechos.",
};

export const revalidate = 86400;

/** Última revisión del texto. Actualizar al modificarlo. */
const ACTUALIZADA = "2026-08-08";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-ink">{titulo}</h2>
      <div className="mt-3 flex flex-col gap-3 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <>
      <Nav />
      <main className="shell relative z-10 max-w-3xl pt-32 pb-24 sm:pt-40">
        <p className="eyebrow">Legales</p>
        <h1 className="mt-3 font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight text-ink">
          Política de privacidad
        </h1>
        <p className="mt-3 text-sm text-ink-mute">
          Última actualización: {fechaLarga(ACTUALIZADA)}
        </p>

        {/* Aviso honesto: este texto todavía no pasó por revisión legal. */}
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-amber-300">
            Borrador pendiente de revisión legal
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Este texto describe con exactitud cómo funciona la plataforma hoy, pero todavía no fue
            revisado por un profesional. Si necesitás una respuesta con validez legal, escribinos a{" "}
            <a href={`mailto:${ORG.email}`} className="text-blue-300 underline">
              {ORG.email}
            </a>
            .
          </p>
        </div>

        <Seccion titulo="En una línea">
          <p>
            {ORG.name} no te pide datos para navegar, no usa cookies en el sitio público, no
            comparte información con anunciantes y no guarda tu dirección IP.
          </p>
        </Seccion>

        <Seccion titulo="Qué se guarda cuando visitás el sitio">
          <p>
            Medimos qué contenido resulta útil, pero está diseñado para{" "}
            <strong className="text-ink">no poder identificarte</strong>. Concretamente:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-ink">Un número al azar en tu navegador.</strong> Sirve para
              no contar dos veces a la misma persona. No tiene tu nombre, tu correo ni nada tuyo.
              Se borra al limpiar los datos del sitio en tu navegador.
            </li>
            <li>
              <strong className="text-ink">Tu dirección IP no se guarda.</strong> Se guarda un
              resultado matemático irreversible calculado a partir de ella, que además cambia
              todos los días. No se puede volver a la IP original ni seguir a una persona entre un
              día y el siguiente.
            </li>
            <li>
              <strong className="text-ink">Qué se tocó y qué día.</strong> Sin hora exacta, sin
              orden de navegación y sin forma de reconstruir un recorrido.
            </li>
          </ul>
          <p>
            Con eso podemos saber que una convocatoria tuvo 200 aperturas. No podemos saber quién
            las abrió, y no es un límite de política: es un límite de lo que guardamos.
          </p>
        </Seccion>

        <Seccion titulo="Cookies">
          <p>
            <strong className="text-ink">El sitio público no usa cookies.</strong> No hay
            seguimiento de terceros, ni píxeles de redes sociales, ni publicidad. Las tipografías
            están alojadas acá mismo, así que tu navegador tampoco le pide nada a Google.
          </p>
          <p>
            Las únicas cookies aparecen si iniciás sesión como embajador o administrador, y sirven
            para mantener esa sesión abierta. Sin ellas no podrías usar el panel.
          </p>
        </Seccion>

        <Seccion titulo="Si sos embajador o embajadora">
          <p>
            Para que tengas cuenta guardamos tu correo, tu nombre, y lo que decidas publicar en tu
            perfil: foto, presentación, biografía y redes sociales. Esa información aparece
            públicamente en la página de tu universidad, porque ese es el objetivo del rol.
          </p>
          <p>
            Solo podés ver y editar el contenido de tu universidad. Esa separación está garantizada
            en la base de datos, no en la pantalla: aunque alguien intentara saltearse la interfaz,
            no obtendría contenido de otra universidad.
          </p>
        </Seccion>

        <Seccion titulo="Si sos profesor o profesora particular">
          <p>
            Los datos de contacto que aparecen en la sección de profesores —nombre, materias y
            WhatsApp— los carga el embajador de cada universidad, y deben publicarse{" "}
            <strong className="text-ink">solo con tu consentimiento</strong>.
          </p>
          <p>
            Si tus datos están publicados y no diste ese permiso, escribinos a{" "}
            <a href={`mailto:${ORG.email}`} className="text-blue-300 underline">
              {ORG.email}
            </a>{" "}
            y los damos de baja de inmediato. No necesitás explicar por qué.
          </p>
        </Seccion>

        <Seccion titulo="Con quién se comparte">
          <p>Con nadie, en el sentido de vender o ceder datos. Se usan tres proveedores:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-ink">Supabase</strong> — guarda la base de datos y las fotos
              de perfil.
            </li>
            <li>
              <strong className="text-ink">Vercel</strong> — publica el sitio y lo entrega a los
              visitantes.
            </li>
            <li>
              <strong className="text-ink">Sentry</strong> — avisa cuando algo falla, para poder
              arreglarlo. Está configurado para no enviar datos personales.
            </li>
          </ul>
          <p>
            No hay Google Analytics, ni herramientas de publicidad, ni redes sociales incrustadas
            en las páginas.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos">
          <p>
            Según la Ley 25.326 de Protección de Datos Personales, podés pedir acceder a tus datos,
            corregirlos o eliminarlos. Escribinos a{" "}
            <a href={`mailto:${ORG.email}`} className="text-blue-300 underline">
              {ORG.email}
            </a>{" "}
            y respondemos.
          </p>
          <p className="text-sm text-ink-mute">
            La Agencia de Acceso a la Información Pública es el organismo de control y atiende
            denuncias por incumplimientos.
          </p>
        </Seccion>

        <Seccion titulo="Cambios">
          <p>
            Si cambiamos algo de lo anterior, actualizamos esta página y la fecha de arriba. Si el
            cambio es importante, lo avisamos también a los embajadores.
          </p>
        </Seccion>

        <div className="mt-12 border-t border-hair pt-6">
          <Link href="/" className="btn btn-ghost text-sm">
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
