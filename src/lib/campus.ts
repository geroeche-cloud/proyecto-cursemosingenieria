/**
 * Campus — hub por universidad. Cada universidad ofrece 4 áreas:
 * Embajador, Oportunidades, Alianzas Académicas y Recursos de estudio.
 * Modelo replicable: sumar una universidad en academy.ts la habilita acá.
 * (Armazón: Alianzas ya funciona; el resto queda como estructura + "próximamente".)
 */
import { UNIVERSITIES, type University } from "@/lib/academy";
import { SOCIALS, ORG } from "@/lib/org";

export const CAMPUS = {
  eyebrow: "Campus",
  title: "Campus",
  lead: "La comunidad de tu universidad, conectada en un solo lugar.",
  description:
    "Cada campus reúne embajadores, alianzas académicas, oportunidades, empresas y recursos para construir una experiencia universitaria más completa, colaborativa y preparada para los desafíos del futuro.",
} as const;

export type CampusAreaId = "embajador" | "oportunidades" | "alianzas" | "recursos";

export type CampusArea = {
  id: CampusAreaId;
  label: string;
  tagline: string;
  description: string;
  status: "activo" | "proximamente";
};

export const CAMPUS_AREAS: CampusArea[] = [
  {
    id: "embajador",
    label: "Embajador",
    tagline: "Quién nos representa",
    description:
      "El recorrido, los proyectos y el contacto de quien lidera Cursemos Ingeniería en la universidad.",
    status: "proximamente",
  },
  {
    id: "oportunidades",
    label: "Noticias y oportunidades",
    tagline: "Becas · convocatorias · eventos",
    description:
      "Becas, convocatorias, capacitaciones, programas, pasantías y eventos — con acceso directo a cada propuesta oficial.",
    status: "activo",
  },
  {
    id: "alianzas",
    label: "Alianzas académicas",
    tagline: "Profesores · tutorías · mentorías",
    description:
      "Profesores particulares, tutorías y mentorías para acompañarte materia por materia.",
    status: "activo",
  },
  {
    id: "recursos",
    label: "Recursos de estudio",
    tagline: "Drives · apuntes · exámenes",
    description:
      "Drives compartidos, apuntes, exámenes y material colaborativo, organizados en un solo acceso.",
    status: "proximamente",
  },
];

/* ---------- Embajador por universidad (modelo replicable) ---------- */

export type AmbassadorSocial = { label: string; href: string };

export type Ambassador = {
  universityId: string;
  name: string;
  role: string;
  career: string;
  /** Ruta local de la foto (/images/...). */
  photo: string;
  bio: string;
  /** Email para el botón principal "Contactar embajador". */
  email: string;
  /** Etiquetas visuales (foco / disciplinas). */
  tags: string[];
  socials: AmbassadorSocial[];
};

export const AMBASSADORS: Record<string, Ambassador> = {
  unco: {
    universityId: "unco",
    name: "Gerónimo Echevarria",
    role: "Fundador de Cursemos Ingeniería",
    career: "Ingeniería en Petróleo",
    photo: "/images/hero-portada.jpg",
    bio: "Estudiante de Ingeniería en Petróleo y fundador de Cursemos Ingeniería. Construyendo una red que conecta estudiantes, universidades, empresas y comunidad para impulsar el liderazgo, la innovación y las oportunidades dentro del ecosistema académico.",
    email: ORG.email,
    tags: ["Ingeniería en Petróleo", "Liderazgo", "Tecnología", "Innovación", "Comunidad"],
    socials: [
      ...SOCIALS.map((s) => ({ label: s.label, href: s.href })),
      { label: "Mail", href: `mailto:${ORG.email}` },
    ],
  },
};

export const getAmbassador = (universityId: string): Ambassador | undefined =>
  AMBASSADORS[universityId];

export const listCampusUniversities = (): University[] => Object.values(UNIVERSITIES);

export const getCampusArea = (id: string): CampusArea | undefined =>
  CAMPUS_AREAS.find((a) => a.id === id);

/** Params estáticos para las rutas dinámicas. */
export const campusUniversityParams = () =>
  Object.values(UNIVERSITIES).map((u) => ({ university: u.id }));

/* ---------- Oportunidades y convocatorias ----------
 * La plataforma es un puente: cada oportunidad enlaza a su convocatoria oficial.
 * `universityId: "global"` = visible en todas las universidades.
 * (Contenido de ejemplo — reemplazar por convocatorias reales.)
 */

export type OpportunityKind =
  | "beca"
  | "pasantia"
  | "programa"
  | "evento"
  | "competencia"
  | "noticia";

export const OPPORTUNITY_KIND_LABEL: Record<OpportunityKind, string> = {
  beca: "Beca",
  pasantia: "Pasantía",
  programa: "Programa",
  evento: "Evento",
  competencia: "Competencia",
  noticia: "Noticia",
};

export type Opportunity = {
  id: string;
  /** Id de universidad o "global" (para todas). */
  universityId: string;
  kind: OpportunityKind;
  title: string;
  org: string;
  description: string;
  /** Fecha límite de inscripción. */
  deadline?: string;
  /** Requisitos excluyentes, listados como ítems. */
  requirements?: string[];
  /** Link oficial de la convocatoria. */
  href: string;
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "beca-roberto-rocca",
    universityId: "global",
    kind: "beca",
    title: "Beca Roberto Rocca",
    org: "Fundación Roberto Rocca",
    description:
      "Apoyo económico y acompañamiento para estudiantes de ingeniería con excelente desempeño académico.",
    deadline: "Inscripción hasta el 30/09",
    requirements: [
      "Estudiante regular de una carrera de ingeniería",
      "Promedio académico destacado",
      "Materias del plan aprobadas en tiempo y forma",
    ],
    href: "https://www.robertorocca.org",
  },
  {
    id: "jovenes-profesionales-tecpetrol",
    universityId: "global",
    kind: "pasantia",
    title: "Programa de Jóvenes Profesionales",
    org: "Tecpetrol",
    description:
      "Primeras experiencias en la industria energética para estudiantes avanzados y recién graduados.",
    deadline: "Convocatoria abierta",
    requirements: [
      "Estudiante avanzado o recién graduado/a",
      "Carreras de ingeniería o afines",
      "Disponibilidad para prácticas presenciales",
    ],
    href: "https://www.tecpetrol.com",
  },
  {
    id: "congreso-argentino-ingenieria",
    universityId: "global",
    kind: "evento",
    title: "Congreso Argentino de Ingeniería",
    org: "CONFEDI",
    description:
      "Encuentro nacional de facultades de ingeniería: charlas, networking y presentación de proyectos.",
    deadline: "Fecha a confirmar",
    href: "https://confedi.org.ar",
  },
];

export const getOpportunitiesForUniversity = (universityId: string): Opportunity[] =>
  OPPORTUNITIES.filter(
    (o) => o.universityId === universityId || o.universityId === "global"
  );

/* ---------- Drives compartidos por estudiantes ----------
 * Cada estudiante comparte su drive con apuntes, exámenes y material.
 * Solo se muestra la persona y su carrera. Sumar entradas acá las publica.
 * (Ejemplos — reemplazar por los drives reales a medida que se carguen.)
 */

export type StudentDrive = {
  id: string;
  universityId: string;
  /** Nombre de la persona que comparte el drive. */
  owner: string;
  /** Carrera de la persona. */
  career: string;
  /** Link al drive compartido. */
  href: string;
};

export const DRIVES: StudentDrive[] = [
  {
    id: "unco-drive-1",
    universityId: "unco",
    owner: "Martina Gómez",
    career: "Ingeniería en Petróleo",
    href: "https://drive.google.com",
  },
  {
    id: "unco-drive-2",
    universityId: "unco",
    owner: "Lucas Fernández",
    career: "Ingeniería Química",
    href: "https://drive.google.com",
  },
  {
    id: "unco-drive-3",
    universityId: "unco",
    owner: "Sofía Ríos",
    career: "Ingeniería Civil",
    href: "https://drive.google.com",
  },
];

export const getDrivesForUniversity = (universityId: string): StudentDrive[] =>
  DRIVES.filter((d) => d.universityId === universityId);
