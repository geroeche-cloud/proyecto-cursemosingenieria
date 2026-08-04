/**
 * Trayectoria — la línea de tiempo viva de Cursemos Ingeniería.
 * Unifica el camino recorrido (formación, experiencias, proyectos) con el
 * horizonte a futuro. Es LA sección donde queda registrado lo que se va
 * haciendo, para que cualquiera pueda seguirlo. Sumar un hito = un objeto.
 */

export type TimelineKind =
  | "formacion"
  | "experiencia"
  | "certificacion"
  | "evento"
  | "proyecto"
  | "hito";

export const KIND_LABEL: Record<TimelineKind, string> = {
  formacion: "Formación",
  experiencia: "Experiencia",
  certificacion: "Certificación",
  evento: "Evento",
  proyecto: "Proyecto",
  hito: "Hito",
};

export type TimelineItem = {
  year: string;
  title: string;
  detail: string;
  kind: TimelineKind;
  state: "hecho" | "presente" | "futuro";
};

export const TIMELINE: TimelineItem[] = [
  // 2024
  {
    year: "2024",
    kind: "formacion",
    state: "hecho",
    title: "Introducción a la Industria Hidrocarburífera",
    detail: "Primer acercamiento formal al sector energético y al funcionamiento de la industria del petróleo y el gas. Duración: 3 meses.",
  },
  {
    year: "2024",
    kind: "formacion",
    state: "hecho",
    title: "Operador de Pozo No Convencional — Curso Básico",
    detail: "Operación de pozos no convencionales: procesos operativos, seguridad y trabajo en campo. Duración: 3 meses.",
  },
  {
    year: "2024",
    kind: "formacion",
    state: "hecho",
    title: "Química Aplicada a la Perforación de Pozos No Convencionales",
    detail: "Principios químicos en la perforación y su impacto en la eficiencia y la seguridad. Duración: 1 mes.",
  },
  // 2025
  {
    year: "2025",
    kind: "formacion",
    state: "hecho",
    title: "Inicio de Ingeniería en Petróleo — UNCo",
    detail: "Comienzo de la carrera en la Universidad Nacional del Comahue, base técnica de todo el proyecto.",
  },
  {
    year: "2025",
    kind: "certificacion",
    state: "hecho",
    title: "Programa de Becarios Roberto Rocca",
    detail: "Seleccionado para el programa, donde continúo participando, fortaleciendo mi desarrollo académico, profesional y personal.",
  },
  {
    year: "2025",
    kind: "experiencia",
    state: "presente",
    title: "Miembro del SPE Comahue Student Chapter",
    detail: "Ingreso al capítulo estudiantil de la Society of Petroleum Engineers en el Comahue: comunidad técnica, networking profesional y vínculo con la industria.",
  },
  // 2026
  {
    year: "2026",
    kind: "proyecto",
    state: "presente",
    title: "Nacimiento de Cursemos Ingeniería",
    detail: "Proyecto académico con recursos, herramientas y contenido para estudiantes de ingeniería, y una comunidad de apoyo.",
  },
  {
    year: "2026",
    kind: "proyecto",
    state: "presente",
    title: "Inicio del desarrollo de Eliott",
    detail: "Plataforma para ayudar a estudiantes a organizar su vida académica: exámenes, objetivos y hábitos de estudio.",
  },
  {
    year: "2026",
    kind: "evento",
    state: "presente",
    title: "Actividades de la Society of Petroleum Engineers (SPE)",
    detail: "Participación en las dinámicas, charlas y actividades del SPE, fortaleciendo el vínculo con la industria y la comunidad de ingeniería.",
  },
  {
    year: "2026",
    kind: "evento",
    state: "presente",
    title: "Voluntarios en Acción — Cuenca Neuquina | Tecpetrol",
    detail: "Primera edición del voluntariado, fortaleciendo la EPET N.º 3. Educación, trabajo colaborativo e impacto en la comunidad.",
  },
  {
    year: "2026",
    kind: "experiencia",
    state: "presente",
    title: "Tecpetrol Inspiring Program",
    detail: "Desarrollo de habilidades profesionales, liderazgo, innovación y vinculación con la industria energética.",
  },
  {
    year: "2026",
    kind: "experiencia",
    state: "presente",
    title: "Programa de Embajadores Tecpetrol",
    detail: "Representación de la compañía en actividades universitarias, divulgación y acercamiento a futuros profesionales.",
  },
  {
    year: "2026",
    kind: "hito",
    state: "presente",
    title: "Fundación de Cursemos Ingeniería",
    detail: "La organización que reúne todos mis proyectos tecnológicos, educativos y académicos bajo una visión común de largo plazo.",
  },
  // Futuro
  {
    year: "2027",
    kind: "hito",
    state: "futuro",
    title: "Consolidación de proyectos",
    detail: "Primeras versiones públicas, colaboradores externos y comunidad en crecimiento.",
  },
  {
    year: "2030",
    kind: "hito",
    state: "futuro",
    title: "Impacto medible",
    detail: "Proyectos lanzados con impacto real en educación y tecnología.",
  },
  {
    year: "2035 →",
    kind: "hito",
    state: "futuro",
    title: "Escala",
    detail: "Una organización tecnológica consolidada, construida y documentada en público.",
  },
];

/** Años en orden ascendente para agrupar la línea de tiempo */
export const TIMELINE_YEARS = [...new Set(TIMELINE.map((t) => t.year))];

/** Habilidades — tejido de competencias */
export const SKILLS = [
  "Ingeniería",
  "Comunicación",
  "Liderazgo",
  "Producto",
  "Contenido",
  "Comunidad",
  "Estrategia",
  "Disciplina",
] as const;

/** Próximos objetivos declarados públicamente */
export const NEXT_OBJECTIVES = [
  "Escalar Eliott hasta su primera versión pública.",
  "Consolidar la comunidad de Cursemos Ingeniería.",
  "Documentar cada proyecto del ecosistema con su ficha completa.",
] as const;
