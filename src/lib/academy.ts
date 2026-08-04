/**
 * Academia — módulo académico de Cursemos Ingeniería.
 * (MÓDULO EN PRUEBA — todavía no está enlazado al sitio público.)
 *
 * ARQUITECTURA NORMALIZADA, CENTRADA EN LA MATERIA
 * ------------------------------------------------
 * Cada entidad existe UNA sola vez, en un registro indexado por id
 * (`Record<id, Entidad>`), pensado para que una futura herramienta de
 * administración pueda crear / editar / eliminar por clave sin tocar nada más:
 *
 *   UNIVERSITIES  — universidades.
 *   SUBJECTS      — materias (la unidad central; existen una única vez).
 *   PROFESSORS    — profesores; cada uno referencia las materias que dicta
 *                   (`subjectIds`) → fuente de verdad del vínculo profe↔materia.
 *   CAREERS       — carreras; su `plan` solo REFERENCIA materias por id,
 *                   agrupadas por etapa. Una materia puede estar en varias carreras.
 *
 * Relaciones (todas DERIVADAS, sin duplicar datos):
 *   - Profesores de una materia   → se derivan de PROFESSORS (índice memoizado).
 *   - Materias de un profesor      → `professor.subjectIds`.
 *   - Carreras que tienen una materia → se derivan de CAREERS.
 *   ⇒ Agregar / editar / eliminar un profesor se refleja automáticamente en
 *     TODAS las carreras donde exista esa materia. No hay información duplicada.
 *
 * Para la UI se expone `resolveCareer(id)`, que proyecta las referencias en una
 * vista lista para renderizar. `validateAcademyData()` verifica integridad
 * referencial (útil para tests y para una futura admin).
 */

import { ORG } from "@/lib/org";

/* ============================================================
   Encabezado del módulo
   ============================================================ */

export const ACADEMY = {
  eyebrow: "Academia",
  title: "Academia",
  subtitle: "Alianzas con profesores particulares",
  alliance: "Alianza académica",
  description:
    "Encontrá profesores particulares para preparar materias, parciales, finales e ingreso a la facultad de Ingeniería.",
} as const;

export type AcademyModule = {
  id: string;
  label: string;
  description: string;
  status: "activo" | "proximamente";
};

/** Módulos de Academia. Hoy solo Profesores Particulares está activo. */
export const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: "profesores",
    label: "Profesores Particulares",
    description:
      "Elegí tu etapa y tu materia para ver los profesores particulares disponibles.",
    status: "activo",
  },
];

/* ============================================================
   Tipos de las entidades (normalizadas)
   ============================================================ */

export type Modality = "presencial" | "virtual" | "ambas";

export const MODALITY_LABEL: Record<Modality, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  ambas: "Presencial y virtual",
};

export type University = {
  id: string;
  name: string;
  short: string;
  city: string;
};

/** Etapa académica (común a las carreras; el orden define la progresión). */
export type Stage = {
  id: string;
  label: string;
};

/** Materia — existe UNA sola vez en el sistema. */
export type Subject = {
  id: string;
  name: string;
  /** Materia destacada (p. ej. Ingreso a la Facultad) → chip especial en la tarjeta. */
  highlight?: boolean;
};

export type Professor = {
  id: string;
  name: string;
  /** Título profesional (p. ej. "Ingeniero en Petróleo"). */
  title: string;
  /** Ruta local de la foto (solo `/images/...`). Sin foto → avatar con iniciales. */
  photo?: string;
  modality: Modality;
  /** Teléfono para WhatsApp en formato internacional (se sanitiza al usarse). */
  whatsapp: string;
  /** Materias que dicta (ids → SUBJECTS). Fuente de verdad del vínculo. */
  subjectIds: string[];
};

/** Una etapa dentro del plan de una carrera: solo referencia materias por id. */
export type CareerStage = {
  stageId: string;
  subjectIds: string[];
};

/** Carrera — solo referencia materias (no las contiene). */
export type Career = {
  id: string;
  universityId: string;
  name: string;
  plan: CareerStage[];
};

/* ============================================================
   Etapas (orden académico)
   ============================================================ */

export const STAGES: Stage[] = [
  { id: "ingreso", label: "Ingreso" },
  { id: "primer", label: "Primer año" },
  { id: "segundo", label: "Segundo año" },
  { id: "tercero", label: "Tercer año" },
  { id: "cuarto", label: "Cuarto año" },
  { id: "quinto", label: "Quinto año" },
];

/* ============================================================
   Universidades
   ============================================================ */

export const UNIVERSITIES: Record<string, University> = {
  unco: {
    id: "unco",
    name: "Universidad Nacional del Comahue",
    short: "UNCo",
    city: "Neuquén",
  },
};

/* ============================================================
   Materias — cada una existe UNA sola vez.
   Se reutilizan entre carreras referenciando su id.
   ============================================================ */

export const SUBJECTS: Record<string, Subject> = {
  // Ingreso
  "ingreso-matematica": { id: "ingreso-matematica", name: "Matemática" },
  "ingreso-fisica": { id: "ingreso-fisica", name: "Física" },
  "ingreso-intro": { id: "ingreso-intro", name: "Introducción a la Ingeniería" },
  "ingreso-facultad": { id: "ingreso-facultad", name: "Ingreso a la Facultad", highlight: true },
  // Ciclo básico (compartido entre muchas ingenierías)
  "analisis-1": { id: "analisis-1", name: "Análisis Matemático I" },
  "analisis-3": { id: "analisis-3", name: "Análisis Matemático III" },
  "algebra": { id: "algebra", name: "Álgebra y Geometría Analítica" },
  "algebra-1": { id: "algebra-1", name: "Álgebra y Geometría I" },
  "algebra-2": { id: "algebra-2", name: "Álgebra y Geometría II" },
  "fisica-1": { id: "fisica-1", name: "Física I" },
  "quimica-general": { id: "quimica-general", name: "Química General" },
  "analisis-2": { id: "analisis-2", name: "Análisis Matemático II" },
  "fisica-2": { id: "fisica-2", name: "Física II" },
  "fisica-3": { id: "fisica-3", name: "Física III" },
  "probabilidad-estadistica": { id: "probabilidad-estadistica", name: "Probabilidad y Estadística" },
  "termodinamica": { id: "termodinamica", name: "Termodinámica" },
  // Específicas de Petróleo
  "mecanica-fluidos": { id: "mecanica-fluidos", name: "Mecánica de los Fluidos" },
  "geologia-petroleo": { id: "geologia-petroleo", name: "Geología del Petróleo" },
  "reservorios-1": { id: "reservorios-1", name: "Reservorios I" },
  "perforacion": { id: "perforacion", name: "Perforación" },
  "produccion-petroleo": { id: "produccion-petroleo", name: "Producción de Petróleo" },
  "proyecto-final": { id: "proyecto-final", name: "Proyecto Final" },
  // Específicas de Química (para demostrar materias compartidas + propias)
  "quimica-organica": { id: "quimica-organica", name: "Química Orgánica" },
  "operaciones-unitarias": { id: "operaciones-unitarias", name: "Operaciones Unitarias" },
};

/* ============================================================
   Profesores — cada uno existe UNA sola vez y referencia sus
   materias (`subjectIds`). Aparecen automáticamente en TODA
   carrera que tenga esas materias.
   ============================================================ */

export const PROFESSORS: Record<string, Professor> = {
  "profe-seba": {
    id: "profe-seba",
    name: "Profe Seba",
    title: "Ingeniero Químico · Profesor de Matemática",
    modality: "ambas",
    whatsapp: "5492996595142",
    subjectIds: ["analisis-1", "analisis-2", "analisis-3", "algebra-1", "algebra-2"],
  },
  "profe-carmen": {
    id: "profe-carmen",
    name: "Profe Carmen",
    title: "Profesorado en Ciencias Físicas",
    modality: "virtual",
    // 02984341032 (local) → internacional AR: +54 9 298 434 1032.
    whatsapp: "5492984341032",
    subjectIds: ["ingreso-facultad", "fisica-1", "fisica-2", "fisica-3", "probabilidad-estadistica"],
  },
};

/* ============================================================
   Carreras — solo referencian materias por id.
   La misma materia (p. ej. "analisis-1", "fisica-1", "quimica-general")
   aparece en varias carreras SIN duplicarse.
   ============================================================ */

export const CAREERS: Record<string, Career> = {
  "unco-petroleo": {
    id: "unco-petroleo",
    universityId: "unco",
    name: "Ingeniería en Petróleo",
    plan: [
      { stageId: "ingreso", subjectIds: ["ingreso-matematica", "ingreso-fisica", "ingreso-intro"] },
      { stageId: "primer", subjectIds: ["analisis-1", "algebra", "fisica-1", "quimica-general"] },
      { stageId: "segundo", subjectIds: ["analisis-2", "fisica-2", "termodinamica"] },
      { stageId: "tercero", subjectIds: ["mecanica-fluidos", "geologia-petroleo"] },
      { stageId: "cuarto", subjectIds: ["reservorios-1", "perforacion"] },
      { stageId: "quinto", subjectIds: ["produccion-petroleo", "proyecto-final"] },
    ],
  },
  // Segunda carrera de ejemplo: comparte el ciclo básico con Petróleo, así
  // Juan (Análisis I) y María (Física I / Química General) aparecen también acá
  // automáticamente. Aún no se muestra en la UI (falta un selector de carrera).
  "unco-quimica": {
    id: "unco-quimica",
    universityId: "unco",
    name: "Ingeniería Química",
    plan: [
      { stageId: "ingreso", subjectIds: ["ingreso-matematica", "ingreso-fisica", "ingreso-intro"] },
      { stageId: "primer", subjectIds: ["analisis-1", "algebra", "fisica-1", "quimica-general"] },
      { stageId: "segundo", subjectIds: ["analisis-2", "fisica-2", "termodinamica", "quimica-organica"] },
      { stageId: "tercero", subjectIds: ["operaciones-unitarias"] },
    ],
  },
};

/* ============================================================
   Selectores por id (base para una futura admin)
   ============================================================ */

export const getUniversity = (id: string): University | undefined => UNIVERSITIES[id];
export const getSubject = (id: string): Subject | undefined => SUBJECTS[id];
export const getProfessor = (id: string): Professor | undefined => PROFESSORS[id];
export const getCareer = (id: string): Career | undefined => CAREERS[id];

export const listUniversities = (): University[] => Object.values(UNIVERSITIES);
export const listSubjects = (): Subject[] => Object.values(SUBJECTS);
export const listProfessors = (): Professor[] => Object.values(PROFESSORS);
export const listCareers = (): Career[] => Object.values(CAREERS);

/** Carreras de una universidad (para el selector de carrera). */
export const listCareersByUniversity = (universityId: string): Career[] =>
  Object.values(CAREERS).filter((c) => c.universityId === universityId);

/* ============================================================
   Relaciones derivadas (sin duplicar datos)
   ============================================================ */

/* Índice memoizado materia → profesores (derivado de PROFESSORS.subjectIds). */
let professorsBySubjectCache: Map<string, Professor[]> | null = null;

function professorsBySubject(): Map<string, Professor[]> {
  if (professorsBySubjectCache) return professorsBySubjectCache;
  const map = new Map<string, Professor[]>();
  for (const professor of Object.values(PROFESSORS)) {
    for (const subjectId of professor.subjectIds) {
      const list = map.get(subjectId) ?? [];
      list.push(professor);
      map.set(subjectId, list);
    }
  }
  professorsBySubjectCache = map;
  return map;
}

/** Profesores que dictan una materia (derivado). */
export const getProfessorsForSubject = (subjectId: string): Professor[] =>
  professorsBySubject().get(subjectId) ?? [];

/** Materias (objetos) que dicta un profesor (lectura directa de subjectIds). */
export function getProfessorSubjects(professorId: string): Subject[] {
  const professor = PROFESSORS[professorId];
  if (!professor) return [];
  return professor.subjectIds
    .map((id) => SUBJECTS[id])
    .filter((s): s is Subject => Boolean(s));
}

/** Carreras cuyo plan incluye una materia (derivado). */
export const getCareersForSubject = (subjectId: string): Career[] =>
  Object.values(CAREERS).filter((c) => c.plan.some((cs) => cs.subjectIds.includes(subjectId)));

/* ============================================================
   Vista resuelta para la UI (proyección de las referencias)
   ============================================================ */

export type ResolvedSubject = Subject & { professors: Professor[] };
export type ResolvedStage = { id: string; label: string; subjects: ResolvedSubject[] };
export type ResolvedCareer = {
  id: string;
  name: string;
  university: University;
  stages: ResolvedStage[];
};

/**
 * Proyecta una carrera (referencias por id) en una estructura lista para
 * renderizar: etapas → materias → profesores resueltos. Devuelve `null` si la
 * carrera o su universidad no existen.
 */
export function resolveCareer(careerId: string): ResolvedCareer | null {
  const career = CAREERS[careerId];
  if (!career) return null;
  const university = UNIVERSITIES[career.universityId];
  if (!university) return null;

  const stages: ResolvedStage[] = [];
  for (const careerStage of career.plan) {
    const stage = STAGES.find((s) => s.id === careerStage.stageId);
    if (!stage) continue;
    const subjects: ResolvedSubject[] = careerStage.subjectIds
      .map((id) => SUBJECTS[id])
      .filter((s): s is Subject => Boolean(s))
      .map((s) => ({ ...s, professors: getProfessorsForSubject(s.id) }));
    stages.push({ id: stage.id, label: stage.label, subjects });
  }

  return { id: career.id, name: career.name, university, stages };
}

/* ============================================================
   Integridad referencial (para tests y futura admin)
   ============================================================ */

/** Devuelve la lista de inconsistencias (referencias a ids inexistentes). Vacío = OK. */
export function validateAcademyData(): string[] {
  const errors: string[] = [];

  for (const professor of Object.values(PROFESSORS)) {
    for (const subjectId of professor.subjectIds) {
      if (!SUBJECTS[subjectId]) {
        errors.push(`Profesor "${professor.id}" referencia una materia inexistente: "${subjectId}".`);
      }
    }
  }

  for (const career of Object.values(CAREERS)) {
    if (!UNIVERSITIES[career.universityId]) {
      errors.push(`Carrera "${career.id}" referencia una universidad inexistente: "${career.universityId}".`);
    }
    for (const careerStage of career.plan) {
      if (!STAGES.find((s) => s.id === careerStage.stageId)) {
        errors.push(`Carrera "${career.id}" referencia una etapa inexistente: "${careerStage.stageId}".`);
      }
      for (const subjectId of careerStage.subjectIds) {
        if (!SUBJECTS[subjectId]) {
          errors.push(`Carrera "${career.id}" referencia una materia inexistente: "${subjectId}".`);
        }
      }
    }
  }

  return errors;
}

/* ============================================================
   WhatsApp / contacto (construcción segura)
   ============================================================ */

/** Deja solo dígitos. E.164 admite hasta 15 dígitos. */
function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 15);
}

export function isValidWhatsappPhone(phone: string): boolean {
  const digits = sanitizePhone(phone);
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Enlace `wa.me` con el mensaje generado dinámicamente según la materia.
 * Devuelve `null` si el teléfono no es válido (el botón se desactiva).
 * Todo el texto se codifica con `encodeURIComponent` (no se inyecta crudo).
 */
export function buildWhatsappUrl(phone: string): string | null {
  const digits = sanitizePhone(phone);
  if (!isValidWhatsappPhone(digits)) return null;
  const message = [
    "Hola!",
    "Te escribo desde la alianza académica con Cursemos Ingeniería.",
    "Quería consultarte por tus clases particulares.",
    "¿Podrías contarme cómo trabajás, modalidad, horarios y valores?",
    "Muchas gracias.",
  ].join("\n");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Mailto para postularse como profesor de una materia (email institucional). */
export function buildProfessorApplicationMailto(subjectName: string): string {
  const subject = `Quiero postularme como profesor particular — ${subjectName}`;
  const body = [
    "Hola Gerónimo,",
    "",
    `Dicto clases particulares de ${subjectName} y me gustaría sumarme a la comunidad de Cursemos Ingeniería.`,
    "",
    "Mi formación es __________________.",
    "Trabajo de forma (presencial / virtual / ambas): __________________.",
    "",
    "Quedo a disposición para conversar.",
    "",
    "Saludos.",
  ].join("\n");
  return `mailto:${ORG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
