import { correrDiagnostico, type Estado } from "@/lib/diagnostico";
import { enlaceEditorSQL } from "@/lib/migraciones";
import { supabaseUrl } from "@/lib/supabase/env";
import { BloqueSQL } from "@/components/admin/BloqueSQL";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

// Siempre fresco: un diagnóstico cacheado no sirve para nada.
export const dynamic = "force-dynamic";

const ICONO: Record<Estado, string> = { ok: "✓", falla: "✕", aviso: "!" };

const COLOR: Record<Estado, { chip: string; texto: string }> = {
  ok: {
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    texto: "text-emerald-300",
  },
  falla: {
    chip: "border-red-500/40 bg-red-500/10 text-red-300",
    texto: "text-red-300",
  },
  aviso: {
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    texto: "text-amber-300",
  },
};

export default async function AdminDiagnosticoPage() {
  const chequeos = await correrDiagnostico();
  const editor = enlaceEditorSQL(supabaseUrl);

  const fallas = chequeos.filter((c) => c.estado === "falla").length;
  const avisos = chequeos.filter((c) => c.estado === "aviso").length;
  const todoBien = fallas === 0 && avisos === 0;

  const hora = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Diagnóstico del sistema</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Verifica lo que puede fallar en silencio: la base, las migraciones, las claves y
          el almacenamiento de fotos. Si algo está mal, acá te dice exactamente qué hacer.
        </p>
      </div>

      {/* Estado general */}
      <div
        className="rounded-2xl border p-5 sm:p-6"
        style={{ background: CARD }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`font-display text-2xl font-bold ${todoBien ? "text-emerald-300" : fallas > 0 ? "text-red-300" : "text-amber-300"}`}>
              {todoBien
                ? "Todo funcionando"
                : fallas > 0
                  ? `${fallas} problema${fallas === 1 ? "" : "s"} que resolver`
                  : `${avisos} aviso${avisos === 1 ? "" : "s"}`}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {chequeos.length} verificaciones · comprobado a las {hora}
            </p>
          </div>
          <a href="/admin/diagnostico" className="btn btn-ghost shrink-0 self-start text-xs sm:self-auto">
            Volver a comprobar
          </a>
        </div>
      </div>

      {/* Detalle */}
      <div className="overflow-hidden rounded-2xl border border-hair">
        <ul className="divide-y divide-hair">
          {chequeos.map((c) => (
            <li key={c.nombre} className="flex flex-col gap-2 px-5 py-4">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[0.65rem] ${COLOR[c.estado].chip}`}
                  aria-hidden
                >
                  {ICONO[c.estado]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{c.nombre}</p>
                  <p className={`mt-0.5 text-sm ${c.estado === "ok" ? "text-ink-soft" : COLOR[c.estado].texto} break-anywhere`}>
                    {c.detalle}
                  </p>
                  {c.arreglo && (
                    <p className="mt-1.5 rounded-lg border border-hair bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-ink-soft break-anywhere">
                      <span className="font-medium text-ink">Cómo resolverlo: </span>
                      {c.arreglo}
                    </p>
                  )}
                  {c.sql && (
                    <BloqueSQL
                      archivo={c.sql.archivo}
                      contenido={c.sql.contenido}
                      editor={editor}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs leading-relaxed text-ink-faint">
        Consejo: revisá esta página después de cada despliegue o de correr una migración.
        Es la forma más rápida de confirmar que todo quedó bien conectado.
      </p>
    </div>
  );
}
