import { Reveal } from "@/components/ui/Reveal";
import { ProfessorCard } from "@/components/academy/ProfessorCard";
import { listProfessors } from "@/lib/academy";

/** Lista de profesores particulares — reutilizable en /academia y en el Campus. */
export function ProfesoresList() {
  const professors = listProfessors();
  return (
    <div className="flex flex-col gap-4">
      {professors.map((p, i) => (
        <Reveal key={p.id} delay={0.05 * i}>
          <ProfessorCard professor={p} />
        </Reveal>
      ))}
    </div>
  );
}
