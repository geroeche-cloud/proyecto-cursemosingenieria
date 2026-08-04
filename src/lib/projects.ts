/**
 * Hub de proyectos del ecosistema Cursemos Ingeniería.
 * Estructura reutilizable y personalizable: cada proyecto activa solo los
 * campos que necesita. Sumar un proyecto = agregar un objeto.
 */

export type ProjectStatus =
  | "idea"
  | "investigacion"
  | "diseno"
  | "desarrollo"
  | "beta"
  | "lanzado"
  | "escalando"
  | "pausado";

export const STATUS: Record<
  ProjectStatus,
  { label: string; order: number; tone: "blue" | "green" | "amber" | "steel" }
> = {
  idea: { label: "Idea", order: 0, tone: "steel" },
  investigacion: { label: "Investigación", order: 1, tone: "steel" },
  diseno: { label: "Diseño", order: 2, tone: "blue" },
  desarrollo: { label: "Desarrollo", order: 3, tone: "blue" },
  beta: { label: "Beta", order: 4, tone: "amber" },
  lanzado: { label: "Lanzado", order: 5, tone: "green" },
  escalando: { label: "Escalando", order: 6, tone: "green" },
  pausado: { label: "Pausado", order: 7, tone: "steel" },
};

export type Accent = "blue" | "green" | "titanium";

export const ACCENT: Record<Accent, { from: string; to: string; ink: string; glow: string }> = {
  blue: { from: "#3b6bff", to: "#0a1836", ink: "#9cb6ff", glow: "rgba(59,107,255,0.5)" },
  green: { from: "#8dd4a2", to: "#0a1a14", ink: "#b9e9c6", glow: "rgba(141,212,162,0.45)" },
  titanium: { from: "#c9d2de", to: "#12151d", ink: "#e3e8ef", glow: "rgba(200,210,225,0.4)" },
};

export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  status: ProjectStatus;
  year: string;
  accent: Accent;
  summary: string;
  objective: string;
  description: string[];
  vision?: string;
  features?: string[];
  image?: string;
  imageFit?: "cover" | "contain";
  gallery?: string[];
  tech: string[];
  team: { name: string; role: string }[];
  roadmap: { label: string; done: boolean }[];
  updates: { date: string; text: string }[];
  collaborate: string[];
  links?: ProjectLink[];
  featured?: boolean;
  draft?: boolean;
};

const DISCORD = "https://discord.gg/KUTG4Zbnc";
const DRIVE = "https://drive.google.com/drive/folders/1qXC6Ohex0L4Til6DgYxo2Y9oXghLFnwk?usp=sharing";

export const PROJECTS: Project[] = [
  {
    slug: "cursemos-ingenieria",
    name: "Cursemos Ingeniería",
    tagline: "Aprendemos hoy, ingeniamos el mañana.",
    category: "Educación · Comunidad",
    status: "escalando",
    year: "2026 →",
    accent: "blue",
    image: "/images/cursemos-cover.jpg",
    summary:
      "El proyecto más sólido del ecosistema: recursos, herramientas y contenido para estudiantes de ingeniería, con una comunidad activa que crece.",
    objective:
      "Que ningún estudiante transite la carrera solo. Democratizar el acceso al conocimiento de ingeniería.",
    description: [
      "Cursemos Ingeniería resuelve la dificultad y la soledad de transitar una carrera de ingeniería: reúne apuntes, modelos de examen y teoría organizada.",
      "Más que contenido, es una comunidad activa donde los estudiantes comparten, se ayudan y avanzan juntos.",
    ],
    tech: ["Comunidad", "Contenido", "Redes", "Recursos académicos"],
    team: [{ name: "Gerónimo Echevarria", role: "Fundador" }],
    roadmap: [
      { label: "Comunidad activa y recursos base", done: true },
      { label: "Biblioteca académica organizada", done: true },
      { label: "Plataforma propia de contenidos", done: false },
      { label: "Red de referentes por materia", done: false },
    ],
    updates: [{ date: "2026", text: "Crecimiento de la comunidad y del repositorio académico." }],
    collaborate: [
      "Compartir apuntes o material de estudio",
      "Ser referente de una materia",
      "Sumar tu universidad a la red",
    ],
    links: [
      { label: "Instagram", href: "https://www.instagram.com/cursemosingenieria" },
      { label: "TikTok", href: "https://www.tiktok.com/@cursemos.ingenieria" },
      { label: "YouTube", href: "https://www.youtube.com/@CursemosIngenier%C3%ADa" },
      { label: "Comunidad Discord", href: DISCORD },
      { label: "Drive académico", href: DRIVE },
    ],
    featured: true,
  },
  {
    slug: "eliott",
    name: "Eliott",
    tagline: "El tiempo que te queda, visible.",
    category: "Producto · EdTech",
    status: "desarrollo",
    year: "2026 →",
    accent: "green",
    image: "/images/eliott-mascot.png",
    imageFit: "contain",
    gallery: ["/images/eliott-app.png", "/images/eliott-problema.png"],
    summary:
      "El calendario que ayuda a los estudiantes a organizar su tiempo académico de forma simple, visual y efectiva.",
    objective:
      "Que cada estudiante vea, de un vistazo, cuánto tiempo real le queda para cada examen y cómo distribuir su carga.",
    vision:
      "Que estudiar deje de ser caótico. Eliott convierte fechas y exámenes en un mapa claro del tiempo que te queda.",
    features: ["Cuenta regresiva por examen", "Detección de colisiones", "Mapa de carga"],
    description: [
      "Los estudiantes gestionan su carrera con recordatorios dispersos y sin una visión del conjunto. Eliott lo resuelve.",
      "Reúne exámenes, cuenta regresiva, detección de colisiones entre fechas y un mapa de carga, en una experiencia clara y motivadora.",
    ],
    tech: ["Calendario", "Web App", "Producto", "Diseño de experiencia"],
    team: [{ name: "Gerónimo Echevarria", role: "Fundador · Producto" }],
    roadmap: [
      { label: "Concepto y visión", done: true },
      { label: "Diseño de la experiencia", done: true },
      { label: "Desarrollo del primer prototipo", done: false },
      { label: "Beta con estudiantes reales", done: false },
      { label: "Lanzamiento público", done: false },
    ],
    updates: [{ date: "2026", text: "Inicio del desarrollo. Definición de producto, marca y experiencia." }],
    collaborate: [
      "Sumarte como desarrollador/a o diseñador/a",
      "Ser estudiante de prueba (beta)",
      "Aportar feedback sobre organización académica",
    ],
    featured: true,
  },
  {
    slug: "proyectos-academicos",
    name: "Proyectos Académicos",
    tagline: "Ingeniería aplicada, documentada como proyecto.",
    category: "Ingeniería",
    status: "desarrollo",
    year: "En curso",
    accent: "titanium",
    summary:
      "Trabajos, cálculos y experimentos de la formación en Ingeniería en Petróleo, tratados como proyectos reales y documentados.",
    objective: "Aplicar el conocimiento técnico a problemas concretos y dejar registro del proceso.",
    description: [
      "Cada trabajo académico relevante se documenta acá: el problema, el enfoque, las herramientas y el resultado.",
    ],
    tech: ["Ingeniería en Petróleo", "Análisis", "Modelado"],
    team: [{ name: "Gerónimo Echevarria", role: "Autor" }],
    roadmap: [
      { label: "Definir el formato de documentación", done: true },
      { label: "Documentar los primeros trabajos", done: false },
    ],
    updates: [{ date: "2026", text: "Definición del formato de documentación." }],
    collaborate: ["Proponer un problema real de la industria", "Mentoría técnica"],
    draft: true,
  },
  {
    slug: "investigacion",
    name: "Línea de Investigación",
    tagline: "Energía, tecnología y futuro.",
    category: "Investigación",
    status: "idea",
    year: "Futuro",
    accent: "titanium",
    summary: "Una línea abierta para explorar problemas de energía y tecnología con horizonte de largo plazo.",
    objective: "Identificar problemas que valga la pena resolver en las próximas décadas.",
    description: ["Espacio reservado para futuras investigaciones del ecosistema. Se documentará desde la primera hipótesis."],
    tech: [],
    team: [{ name: "Gerónimo Echevarria", role: "Fundador" }],
    roadmap: [{ label: "Definir preguntas de investigación", done: false }],
    updates: [{ date: "2026", text: "Línea abierta." }],
    collaborate: ["Sumar experiencia de investigación", "Proponer líneas de trabajo"],
    draft: true,
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
