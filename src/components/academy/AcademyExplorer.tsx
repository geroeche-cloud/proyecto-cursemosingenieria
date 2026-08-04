"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ProfessorCard } from "@/components/academy/ProfessorCard";
import { EmptyProfessorState } from "@/components/academy/EmptyProfessorState";
import {
  resolveCareer,
  type Career,
  type ResolvedStage,
  type University,
} from "@/lib/academy";
import { cn } from "@/lib/cn";

const ease = [0.16, 1, 0.3, 1] as const;

const panel: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** Encabezado de paso — kicker metálico + título grande y blanco. */
function StepHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-7 flex flex-col gap-3">
      <span className="chip w-fit rounded-full px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ti-100">
        {kicker}
      </span>
      <h3 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h3>
    </div>
  );
}

/** Ícono de carrera (birrete / plan de estudios). */
function CareerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  );
}

/** Ícono de "ingreso" (entrar / iniciar el recorrido). */
function EntranceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

/** Tile de carrera — badge metálico, nombre grande y meta (etapas · materias). */
function CareerTile({
  career,
  active,
  onSelect,
}: {
  career: Career;
  active: boolean;
  onSelect: () => void;
}) {
  const stagesCount = career.plan.length;
  const subjectsCount = career.plan.reduce((n, cs) => n + cs.subjectIds.length, 0);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 text-left transition-all sheen lift sm:p-5",
        active ? "glass-lux chrome-edge academy-stage-active" : "academy-tile"
      )}
    >
      <span className={cn("academy-badge shrink-0", active && "academy-badge--active")}>
        <CareerIcon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={cn(
            "font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl",
            active ? "text-white" : "text-ink-soft group-hover:text-ink"
          )}
        >
          {career.name}
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.16em]",
            active ? "text-blue-300" : "text-ink-mute"
          )}
        >
          {active ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 pulse-dot" />
              En esta carrera
            </>
          ) : (
            `${stagesCount} etapas · ${subjectsCount} materias`
          )}
        </span>
      </div>
    </button>
  );
}

/** Tile de etapa — badge metálico (ícono/nº), etiqueta grande y estado activo claro. */
function StageTile({
  stage,
  index,
  active,
  onSelect,
}: {
  stage: ResolvedStage;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl p-4 text-left transition-all sheen lift sm:p-5",
        active ? "glass-lux chrome-edge academy-stage-active" : "academy-tile"
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("academy-badge", active && "academy-badge--active")}>
          {index === 0 ? <EntranceIcon /> : index}
        </span>
        <span
          className={cn(
            "font-mono text-[0.62rem] tracking-[0.22em]",
            active ? "text-ti-100" : "text-ink-mute"
          )}
        >
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <p
          className={cn(
            "font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl",
            active ? "text-white" : "text-ink-soft group-hover:text-ink"
          )}
        >
          {stage.label}
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] transition-opacity",
            active
              ? "text-blue-300 opacity-100"
              : "text-ink-mute opacity-0 group-hover:opacity-70"
          )}
        >
          {active ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 pulse-dot" />
              En esta etapa
            </>
          ) : (
            "Seleccionar"
          )}
        </span>
      </div>
    </button>
  );
}

/**
 * Explorador de profesores particulares. Flujo progresivo en una sola pantalla:
 *   Carrera → Etapa → Materia → Profesores.
 * La universidad se recibe como contexto (hoy hay una sola). La carrera resuelve
 * su plan bajo demanda (`resolveCareer`), así solo se proyecta la carrera elegida.
 */
export function AcademyExplorer({
  university,
  careers,
}: {
  university: University;
  careers: Career[];
}) {
  const [careerId, setCareerId] = useState<string | null>(
    careers.length === 1 ? careers[0].id : null
  );
  const [stageId, setStageId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);

  const career = useMemo(
    () => (careerId ? resolveCareer(careerId) : null),
    [careerId]
  );
  const stage = useMemo(
    () => career?.stages.find((s) => s.id === stageId) ?? null,
    [career, stageId]
  );
  const subject = useMemo(
    () => stage?.subjects.find((s) => s.id === subjectId) ?? null,
    [stage, subjectId]
  );
  const professors = useMemo(() => subject?.professors ?? [], [subject]);

  const selectCareer = useCallback((id: string) => {
    setCareerId(id);
    setStageId(null);
    setSubjectId(null);
  }, []);

  const selectStage = useCallback((id: string) => {
    setStageId(id);
    setSubjectId(null);
  }, []);

  const selectSubject = useCallback((id: string) => setSubjectId(id), []);

  return (
    <div className="flex flex-col gap-12">
      {/* Paso 1 — Carrera */}
      <div>
        <StepHeader kicker="Paso 1" title={`Elegí tu carrera · ${university.short}`} />
        <div className="grid gap-3 sm:grid-cols-2">
          {careers.map((c) => (
            <CareerTile
              key={c.id}
              career={c}
              active={c.id === careerId}
              onSelect={() => selectCareer(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Paso 2 — Etapa */}
      <AnimatePresence mode="wait">
        {career && (
          <motion.div
            key={career.id}
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.45, ease }}
          >
            <StepHeader kicker="Paso 2" title={`Elegí tu etapa · ${career.name}`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {career.stages.map((s, i) => (
                <StageTile
                  key={s.id}
                  stage={s}
                  index={i}
                  active={s.id === stageId}
                  onSelect={() => selectStage(s.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paso 3 — Materia */}
      <AnimatePresence mode="wait">
        {stage && (
          <motion.div
            key={stage.id}
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.45, ease }}
          >
            <StepHeader kicker="Paso 3" title={`Elegí la materia · ${stage.label}`} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stage.subjects.map((s) => {
                const active = s.id === subjectId;
                const count = s.professors.length;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSubject(s.id)}
                    aria-pressed={active}
                    className={cn(
                      "group flex items-center justify-between gap-3 rounded-2xl p-4 text-left transition-all sheen lift sm:p-5",
                      active ? "glass-lux chrome-edge academy-stage-active" : "academy-tile"
                    )}
                  >
                    <span
                      className={cn(
                        "font-display text-base font-medium leading-tight sm:text-lg",
                        active ? "text-white" : "text-ink-soft group-hover:text-ink"
                      )}
                    >
                      {s.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em]",
                        count > 0
                          ? active
                            ? "chip text-ti-100"
                            : "border border-blue-500/40 bg-blue-500/10 text-blue-300"
                          : "border border-hair text-ink-mute"
                      )}
                    >
                      {count > 0 ? `${count} prof.` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paso 4 — Profesores */}
      <AnimatePresence mode="wait">
        {subject && (
          <motion.div
            key={subject.id}
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.45, ease }}
          >
            <StepHeader kicker="Paso 4" title={`Profesores · ${subject.name}`} />
            <div className="flex flex-col gap-4">
              {professors.length > 0 ? (
                professors.map((p) => (
                  <ProfessorCard key={p.id} professor={p} />
                ))
              ) : (
                <EmptyProfessorState subjectName={subject.name} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
