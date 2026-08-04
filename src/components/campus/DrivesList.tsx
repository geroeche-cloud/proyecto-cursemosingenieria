import { Reveal } from "@/components/ui/Reveal";
import { getDrivesForUniversity, type StudentDrive } from "@/lib/campus";

function DriveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 4h8l5 9-4 7H7l-4-7 5-9Z" />
      <path d="m8 4 4 9 4-9M3.5 13h17M7 20l5-7 5 7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Fila de drive: solo persona + carrera, con acceso directo. */
function DriveRow({ drive }: { drive: StudentDrive }) {
  return (
    <div
      className="glass-lux chrome-edge flex flex-col gap-4 rounded-2xl p-5 sheen sm:flex-row sm:items-center sm:justify-between sm:p-6"
      style={{ background: "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)" }}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl chip text-ti-100">
          <DriveIcon />
        </span>
        <div>
          <h4 className="font-display text-lg font-semibold text-ink">
            Drive de {drive.owner}
          </h4>
          <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.14em] text-ti-500">
            {drive.career}
          </p>
        </div>
      </div>
      <a
        href={drive.href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-blue shrink-0 self-start sm:self-auto"
      >
        Acceder
        <ArrowIcon />
      </a>
    </div>
  );
}

/** Lista de drives compartidos por estudiantes de una universidad. */
export function DrivesList({ universityId }: { universityId: string }) {
  const drives = getDrivesForUniversity(universityId);

  if (drives.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 text-center sm:p-10" style={{ borderStyle: "dashed" }}>
        <p className="font-display text-lg font-semibold text-ink">
          Todavía no hay drives cargados.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          Muy pronto vas a poder acceder al material compartido por estudiantes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {drives.map((d, i) => (
        <Reveal key={d.id} delay={0.05 * i}>
          <DriveRow drive={d} />
        </Reveal>
      ))}
    </div>
  );
}
