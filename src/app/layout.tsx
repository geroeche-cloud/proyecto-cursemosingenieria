import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { IntroLoader } from "@/components/ui/IntroLoader";
import { SiteBackdrop } from "@/components/ui/SiteBackdrop";
import { SoloPublico } from "@/components/ui/SoloPublico";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Sin `weight`: next/font usa la versión VARIABLE de cada familia, que trae
// todos los grosores en un solo archivo. Antes eran cuatro archivos de Space
// Grotesk y dos de JetBrains; ahora es uno de cada una. Mismos grosores
// disponibles, misma tipografía, seis descargas menos en la primera visita.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display-var",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cursemos Ingeniería — Comunidad nacional de ingeniería",
    template: "%s · Cursemos Ingeniería",
  },
  description:
    "Cursemos Ingeniería es la red que conecta estudiantes, universidades, empresas y oportunidades para fortalecer el ecosistema de la ingeniería en Argentina.",
  keywords: [
    "Cursemos Ingeniería",
    "ingeniería Argentina",
    "profesores particulares ingeniería",
    "becas y pasantías ingeniería",
    "comunidad de estudiantes",
    "Universidad Nacional del Comahue",
    "Neuquén",
  ],
  authors: [{ name: "Cursemos Ingeniería" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    title: "Cursemos Ingeniería — Comunidad nacional de ingeniería",
    description:
      "La red que conecta estudiantes, universidades, empresas y oportunidades de la ingeniería en Argentina.",
    siteName: "Cursemos Ingeniería",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursemos Ingeniería",
    description:
      "La red nacional de la ingeniería argentina: estudiantes, universidades, empresas y oportunidades.",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Corre ANTES de pintar: quien ya vio la intro en esta sesión no ve
            ni un parpadeo. Tres líneas en vez de un componente de React con
            estado, y sin esperar a la hidratación. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('ei-intro'))document.documentElement.className+=' intro-vista';else sessionStorage.setItem('ei-intro','1')}catch(e){}`,
          }}
        />
        {/* Sin JavaScript, la clase .visible nunca llega y el contenido
            quedaría invisible para siempre. Esto lo garantiza. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}.intro{display:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-full grain">
        <SiteBackdrop />
        <RevealObserver />
        {/* La intro cinematográfica (con sonido) es para quien llega al sitio.
            Nadie que entra a publicar una noticia quiere verla otra vez. */}
        <SoloPublico>
          <IntroLoader />
        </SoloPublico>
        {children}
      </body>
    </html>
  );
}
