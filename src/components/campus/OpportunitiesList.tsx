import { Reveal } from "@/components/ui/Reveal";
import {
  OPPORTUNITY_KIND_LABEL,
  getOpportunitiesForUniversity,
  type Opportunity,
} from "@/lib/campus";

function ExternalArrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

/** Tarjeta de programa: tipo, fecha límite, requisitos excluyentes y acceso oficial. */
function OpportunityCard({ o }: { o: Opportunity }) {
  const hasReqs = o.requirements && o.requirements.length > 0;
  return (
    <article
      className="glass-lux chrome-edge relative flex h-full flex-col gap-4 rounded-3xl p-6 sheen lift sm:p-7"
      style={{ background: "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)" }}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-blue-300">
          {OPPORTUNITY_KIND_LABEL[o.kind]}
        </span>
        {o.deadline && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hair px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-mute">
            <ClockIcon />
            {o.deadline}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold leading-snug text-ink">{o.title}</h3>
        <p className="mt-1 text-sm font-medium text-ti-500">{o.org}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{o.description}</p>
      </div>

      {hasReqs && (
        <div className="mt-1 border-t border-hair pt-4">
          <p className="mb-2.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-mute">
            Requisitos excluyentes
          </p>
          <ul className="flex flex-col gap-2">
            {o.requirements!.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm leading-snug text-ink-soft">
                <CheckIcon />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={o.href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-blue mt-auto w-full text-sm"
      >
        Ver convocatoria
        <ExternalArrow />
      </a>
    </article>
  );
}

/** Programas vigentes — puente directo al link oficial de cada convocatoria. */
export function OpportunitiesList({ universityId }: { universityId: string }) {
  const items = getOpportunitiesForUniversity(universityId);

  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 text-center sm:p-10" style={{ borderStyle: "dashed" }}>
        <p className="font-display text-lg font-semibold text-ink">
          Pronto vas a encontrar convocatorias acá.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          Estamos sumando becas, pasantías, programas y eventos para vos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((o, i) => (
        <Reveal key={o.id} delay={0.05 * i}>
          <OpportunityCard o={o} />
        </Reveal>
      ))}
    </div>
  );
}
