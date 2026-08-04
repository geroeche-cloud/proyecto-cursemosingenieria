import { buildProfessorApplicationMailto } from "@/lib/academy";

/**
 * Estado "sin profesor" para una materia. Nunca deja un espacio vacío: invita a
 * postularse. El botón usa el email institucional con asunto y cuerpo prellenados.
 */
export function EmptyProfessorState({ subjectName }: { subjectName: string }) {
  const mailto = buildProfessorApplicationMailto(subjectName);

  return (
    <article
      className="glass rounded-3xl p-6 sm:p-8"
      style={{ borderStyle: "dashed" }}
    >
      <span className="eyebrow flex items-center gap-3">
        <span className="metal-tick" />
        Vacante
      </span>
      <h4 className="mt-4 font-display text-xl font-semibold text-ink">
        Actualmente estamos buscando un profesor para esta materia.
      </h4>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-soft">
        Si dictás {subjectName} y querés formar parte de la comunidad de Cursemos
        Ingeniería, podés postularte.
      </p>
      <a href={mailto} className="btn btn-ghost mt-6 text-sm">
        Quiero postularme
      </a>
    </article>
  );
}
