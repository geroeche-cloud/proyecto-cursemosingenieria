/**
 * Campus — textos de la portada del hub de universidades.
 *
 * Todo el contenido real (universidades, embajadores, noticias, oportunidades,
 * profesores y drives) vive en la base de datos y se lee con los clientes de
 * Supabase. Acá solo quedan los textos fijos de la sección.
 */

export const CAMPUS = {
  eyebrow: "Campus",
  title: "Campus",
  lead: "La comunidad de tu universidad, conectada en un solo lugar.",
  description:
    "Cada campus reúne embajadores, alianzas académicas, oportunidades, empresas y recursos para construir una experiencia universitaria más completa, colaborativa y preparada para los desafíos del futuro.",
} as const;
