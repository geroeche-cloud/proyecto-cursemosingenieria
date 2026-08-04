import Image from "next/image";
import { ACCENT, type Project } from "@/lib/projects";
import { cn } from "@/lib/cn";

/**
 * Portada visual del proyecto — usa imagen real si existe, si no una portada
 * abstracta con el color de acento del proyecto.
 */
export function ProjectCover({
  project,
  variant = "card",
  featured = false,
  className,
}: {
  project: Project;
  variant?: "card" | "hero";
  featured?: boolean;
  className?: string;
}) {
  const a = ACCENT[project.accent];
  const initial = project.name.charAt(0);

  const height =
    variant === "hero"
      ? "h-64 sm:h-80"
      : featured
        ? "h-52 sm:h-60"
        : "h-44";

  const rounded = variant === "hero" ? "rounded-3xl" : "rounded-2xl";

  // Real image cover
  if (project.image) {
    const contain = project.imageFit === "contain";
    return (
      <div
        className={cn("relative overflow-hidden", height, rounded, className)}
        style={
          contain
            ? { background: `radial-gradient(120% 100% at 50% 22%, ${a.from}26, ${a.to} 82%)` }
            : undefined
        }
      >
        <Image
          src={project.image}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className={cn(contain ? "object-contain p-4 sm:p-6" : "object-cover object-center")}
        />
        {!contain && (
          <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
        )}
        <span
          className="absolute left-5 top-5 rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] backdrop-blur-md"
          style={{ color: a.ink, borderColor: `${a.ink}44`, background: "rgba(6,7,12,0.4)" }}
        >
          {project.category}
        </span>
      </div>
    );
  }

  // Abstract accent cover
  return (
    <div
      className={cn("relative overflow-hidden", height, rounded, className)}
      style={{ background: `linear-gradient(150deg, ${a.from}2e, ${a.to} 78%)` }}
      aria-hidden
    >
      <div
        className="absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${a.glow}, transparent 70%)` }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 80% 80% at 70% 30%, #000, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 70% 30%, #000, transparent 75%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/10 to-transparent" />
      <span
        className={cn(
          "absolute font-display font-bold leading-none tracking-tight",
          variant === "hero" ? "-right-4 bottom-[-2rem] text-[16rem]" : "-right-2 bottom-[-1.2rem] text-[9rem]"
        )}
        style={{ color: a.ink, opacity: 0.16 }}
      >
        {initial}
      </span>
      <span
        className="absolute left-5 top-5 rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em]"
        style={{ color: a.ink, borderColor: `${a.ink}44`, background: `${a.from}1a` }}
      >
        {project.category}
      </span>
      {variant === "hero" && (
        <span
          className="absolute bottom-6 left-6 font-display text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: a.ink }}
        >
          {project.name}
        </span>
      )}
    </div>
  );
}
