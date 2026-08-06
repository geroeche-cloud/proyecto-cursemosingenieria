/**
 * Campus — textos de la portada del hub de universidades.
 *
 * Todo el contenido real (universidades, embajadores, noticias, oportunidades,
 * profesores y drives) vive en la base de datos y se lee con los clientes de
 * Supabase. Acá solo quedan los textos fijos de la sección.
 */

export const CAMPUS = {
  eyebrow: "La red de ingeniería",
  title: "Campus",
  lead: "Cada universidad, un nodo. Todas conectadas en una misma red.",
  description:
    "Cada campus reúne a su embajador, alianzas académicas, oportunidades, empresas y recursos de estudio. Y ninguno está aislado: lo que se construye en una facultad puede impulsar a un estudiante a mil kilómetros de distancia.",
} as const;
