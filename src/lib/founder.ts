/**
 * Perfil personal del fundador — biografía expandida de Gerónimo Echevarría.
 * Esta info representa a la PERSONA (embajador), no a la organización.
 * Se muestra en /embajadores ("Conocer trayectoria completa").
 */
import { SOCIALS, ORG } from "@/lib/org";

export const FOUNDER = {
  name: "Gerónimo Echevarría",
  role: "Fundador de Cursemos Ingeniería",
  ambassador: "Embajador de la Universidad Nacional del Comahue",
  career: "Estudiante de Ingeniería en Petróleo",
  photo: "/images/hero-portada.jpg",
  email: ORG.email,
  bio: "Estudiante de Ingeniería en Petróleo, técnico químico y apasionado por la tecnología, la innovación y la construcción de comunidades capaces de generar impacto real.",
  story: [
    "Fundé Cursemos Ingeniería con una convicción: el futuro no se construye únicamente dentro de las aulas, sino en la conexión entre personas, ideas, universidades, empresas y oportunidades.",
    "Creo que la universidad puede convertirse en mucho más que un espacio de formación académica. Puede ser el lugar donde nacen líderes, proyectos, amistades, tecnologías y soluciones capaces de transformar industrias enteras.",
    "Por eso, Cursemos Ingeniería busca construir una red nacional que impulse a una nueva generación de estudiantes a desarrollar no solo conocimientos técnicos, sino también liderazgo, pensamiento crítico, creatividad, comunicación y la capacidad de convertir ideas en realidades.",
    "Mi objetivo es demostrar que el impacto no comienza el día en que recibimos un título. Comienza mucho antes: en el momento en que decidimos construir, crear y asumir el desafío de mejorar el mundo que nos rodea.",
  ],
  storyClose: {
    a: "Porque las grandes transformaciones no empiezan con recursos extraordinarios.",
    b: "Empiezan cuando personas comunes deciden construir algo extraordinario juntas.",
  },
  vision: [
    "Imagino una generación de estudiantes que no solo aspire a aprobar exámenes, sino también a liderar proyectos, crear tecnología, impulsar comunidades y dejar una huella real en el mundo.",
    "Quiero construir una red donde universidades, empresas y estudiantes trabajen juntos para potenciar el talento, acelerar la innovación y formar a las personas que liderarán los próximos desafíos de nuestra sociedad.",
  ],
  visionClose: [
    {
      a: "Cursemos Ingeniería no busca acompañar el futuro.",
      b: "Busca ayudar a construirlo.",
    },
    {
      a: "Porque el futuro no pertenece a quienes esperan.",
      b: "Pertenece a quienes se animan a imaginarlo, diseñarlo y hacerlo realidad.",
    },
  ],
  socials: [
    ...SOCIALS.map((s) => ({ label: s.label, href: s.href })),
    { label: "Mail", href: `mailto:${ORG.email}` },
  ],
} as const;

/** Proyectos que impulsa (selección para el perfil) + el impacto buscado. */
export const PROFILE_PROJECTS: { slug: string; impact: string }[] = [
  {
    slug: "cursemos-ingenieria",
    impact:
      "Que ningún estudiante transite la carrera solo y que el talento encuentre oportunidades reales dentro de una red nacional.",
  },
  {
    slug: "eliott",
    impact:
      "Que estudiar deje de ser caótico: claridad, foco y organización para miles de estudiantes.",
  },
];

/** Mi recorrido — línea de tiempo agrupada por fases. Solo año + título + detalle
 *  corto (máx. 2 líneas). Sumar un hito = un objeto en `items`. */
export type RecorridoGroup = {
  year: string;
  phase: string;
  items: { title: string; detail: string }[];
};

export const RECORRIDO: RecorridoGroup[] = [
  {
    year: "2024",
    phase: "Primeros pasos",
    items: [
      {
        title: "Técnico Químico — EPET N.º 14 (Neuquén)",
        detail: "Egreso como técnico químico: mis primeros pasos en el mundo de la energía, la industria y la ingeniería.",
      },
      {
        title: "Introducción a la Industria Hidrocarburífera",
        detail: "Primer acercamiento formal al sector energético y a la industria del petróleo y el gas. · 3 meses",
      },
      {
        title: "Operador de Pozo No Convencional — Curso básico",
        detail: "Procesos operativos, seguridad y fundamentos del trabajo en yacimientos no convencionales. · 3 meses",
      },
      {
        title: "Química aplicada a la perforación no convencional",
        detail: "Principios químicos en la perforación y su impacto en la eficiencia y la seguridad. · 1 mes",
      },
    ],
  },
  {
    year: "2025",
    phase: "Comienzo de la universidad",
    items: [
      {
        title: "Ingeniería en Petróleo — Universidad Nacional del Comahue",
        detail: "Inicio de la carrera de Ingeniería en Petróleo en la Universidad Nacional del Comahue.",
      },
      {
        title: "Programa de Becarios Roberto Rocca",
        detail: "Ingreso al programa, enfocado en el desarrollo académico, profesional y personal.",
      },
    ],
  },
  {
    year: "2026",
    phase: "Construcción de proyectos",
    items: [
      {
        title: "Fundación de Cursemos Ingeniería",
        detail: "Una red que conecta estudiantes, universidades, empresas y oportunidades para potenciar a la próxima generación de ingenieros.",
      },
      {
        title: "Voluntarios en Acción — Tecpetrol",
        detail: "Proyectos educativos y comunitarios en la Cuenca Neuquina.",
      },
      {
        title: "Tecpetrol Inspiring Program",
        detail: "Habilidades profesionales, liderazgo e innovación vinculadas al sector energético.",
      },
    ],
  },
  {
    year: "2026",
    phase: "Comunidad y liderazgo",
    items: [
      {
        title: "SPE Comahue Student Chapter",
        detail: "Incorporación oficial al capítulo estudiantil: actividades técnicas, vínculo con la industria y proyectos de la comunidad.",
      },
    ],
  },
];

/** Valores que intento desarrollar. */
export const VALUES: { name: string; detail: string }[] = [
  { name: "Liderazgo", detail: "Inspirar y movilizar personas hacia una visión compartida." },
  { name: "Innovación", detail: "Buscar mejores formas de hacer las cosas, no las de siempre." },
  { name: "Pensamiento crítico", detail: "Cuestionar, analizar y decidir con criterio propio." },
  { name: "Creatividad", detail: "Convertir ideas en proyectos que cambien realidades." },
  { name: "Comunicación", detail: "Transmitir ideas con claridad y conectar con las personas." },
  { name: "Construcción de comunidad", detail: "Tejer redes donde cada persona suma y todos crecen." },
  { name: "Aprendizaje continuo", detail: "Nunca dejar de aprender: la carrera recién empieza." },
];
