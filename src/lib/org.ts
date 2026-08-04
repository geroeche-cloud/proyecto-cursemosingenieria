/**
 * Cursemos Ingeniería — organización.
 * Fuente única de verdad de la identidad institucional.
 */

export const ORG = {
  name: "Cursemos Ingeniería",
  short: "Cursemos",
  monogram: "C",
  established: "2026",
  location: "Neuquén, Argentina",
  founder: "Gerónimo Echevarria",
  email: "geroeche@iCloud.com",
  tagline: "Una organización en construcción.",
  statement:
    "Una visión de largo plazo. Donde las ideas se convierten en proyectos con impacto.",
} as const;

export const NAV = [
  { href: "/#vision", label: "La visión" },
  { href: "/#embajadores", label: "Conocé a los embajadores" },
  { href: "/#colaborar", label: "Sumate a la red" },
] as const;

export const SOCIALS = [
  { id: "linkedin", label: "LinkedIn", handle: "in/echevarriageronimo", href: "https://www.linkedin.com/in/echevarriageronimo/" },
  { id: "instagram", label: "Instagram", handle: "@cursemosingenieria", href: "https://www.instagram.com/cursemosingenieria" },
  { id: "youtube", label: "YouTube", handle: "Cursemos Ingeniería", href: "https://www.youtube.com/@CursemosIngenier%C3%ADa" },
  { id: "tiktok", label: "TikTok", handle: "@cursemos.ingenieria", href: "https://www.tiktok.com/@cursemos.ingenieria" },
] as const;

export type SocialId = (typeof SOCIALS)[number]["id"];

/* ---------- Visión · Propósito · Por qué existe ---------- */

export const VISION = {
  eyebrow: "01 — Manifiesto",
  title: "Más que proyectos. Una visión.",
  blocks: [
    {
      k: "Qué hacemos",
      body: "Creamos proyectos que conectan tecnología, ingeniería y educación.",
    },
    {
      k: "Cómo lo hacemos",
      body: "Construyendo en público, compartiendo cada paso del camino.",
    },
    {
      k: "Por qué lo hacemos",
      body: "Porque las mejores ideas generan impacto cuando se comparten y crecen en comunidad.",
    },
  ],
} as const;

export const PILLARS = ["Enfoque", "Disciplina", "Evolución"] as const;

/* ---------- Filosofía ---------- */

export const PHILOSOPHY = {
  eyebrow: "04 — Filosofía",
  title: "Cómo construimos",
  principles: [
    { title: "Construir antes que esperar", body: "Las oportunidades muchas veces se crean, no se encuentran. La iniciativa es el punto de partida." },
    { title: "Documentar el proceso", body: "Lo que no se registra, se pierde. Cada avance queda escrito y accesible para el futuro." },
    { title: "Transparencia radical", body: "Mostrar decisiones, aprendizajes y errores con la misma claridad que los logros." },
    { title: "Pensar en décadas", body: "Las cosas importantes se construyen despacio. Se optimiza para el largo plazo, no para el aplauso." },
    { title: "Excelencia como estándar", body: "Cada detalle importa. La calidad no se negocia por rapidez." },
    { title: "Compartir para multiplicar", body: "El conocimiento tiene valor real cuando ayuda a otros a avanzar." },
  ],
} as const;

export const VALUES = [
  "Ingeniería",
  "Innovación",
  "Disciplina",
  "Aprendizaje",
  "Excelencia",
  "Transparencia",
  "Documentación",
  "Evolución",
] as const;
