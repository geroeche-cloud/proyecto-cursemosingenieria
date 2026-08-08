import { createClient } from "@/lib/supabase/server";
import { logIfError } from "@/lib/log";
import { fechaCorta } from "@/lib/schedule";
import { DangerForm } from "../DangerForm";
import { restoreItem, purgeItem } from "../actions";

const CARD = "linear-gradient(158deg, #121a2c 0%, #0b1020 100%)";

type Item = {
  tabla: string;
  tipo: string;
  id: string;
  label: string;
  detalle: string;
  fecha: string | null;
};

function fmt(d: string | null) {
  if (!d) return "";
  // Hora de Argentina: sin esto, lo borrado después de las 21 hs aparecía
  // fechado al día siguiente.
  return fechaCorta(d);
}

export default async function AdminPapeleraPage() {
  const supabase = await createClient();

  // La papelera crece para siempre: nada la vacía sola. Sin tope, esta pantalla
  // se vuelve más lenta cada mes hasta volverse inusable, justo cuando más
  // falta hace. Se traen las más recientes de cada tipo, que es lo que alguien
  // viene a buscar acá: lo que se borró hace poco, para recuperarlo.
  const TOPE = 40;

  const [uniRes, profRes, newsRes, oppRes, proRes, drvRes] = await Promise.all([
    supabase.from("universities").select("id, name, short_name, city, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(TOPE),
    supabase.from("profiles").select("id, full_name, email, deleted_at").eq("role", "ambassador").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(TOPE),
    supabase.from("news").select("id, title, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(TOPE),
    supabase.from("opportunities").select("id, title, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(TOPE),
    supabase.from("professors").select("id, name, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(TOPE),
    supabase.from("drives").select("id, owner, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(TOPE),
  ]);
  logIfError("admin papelera", uniRes.error);

  const items: Item[] = [
    ...((uniRes.data ?? []) as { id: string; name: string; short_name: string | null; city: string | null; deleted_at: string }[]).map((r) => ({
      tabla: "universities", tipo: "Universidad", id: r.id, label: r.name,
      detalle: [r.short_name, r.city].filter(Boolean).join(" · "), fecha: r.deleted_at,
    })),
    ...((profRes.data ?? []) as { id: string; full_name: string | null; email: string | null; deleted_at: string }[]).map((r) => ({
      tabla: "profiles", tipo: "Embajador", id: r.id, label: r.full_name || r.email || "Sin nombre",
      detalle: r.email ?? "", fecha: r.deleted_at,
    })),
    ...((newsRes.data ?? []) as { id: string; title: string; deleted_at: string }[]).map((r) => ({
      tabla: "news", tipo: "Noticia", id: r.id, label: r.title, detalle: "", fecha: r.deleted_at,
    })),
    ...((oppRes.data ?? []) as { id: string; title: string; deleted_at: string }[]).map((r) => ({
      tabla: "opportunities", tipo: "Oportunidad", id: r.id, label: r.title, detalle: "", fecha: r.deleted_at,
    })),
    ...((proRes.data ?? []) as { id: string; name: string; deleted_at: string }[]).map((r) => ({
      tabla: "professors", tipo: "Profesor", id: r.id, label: r.name, detalle: "", fecha: r.deleted_at,
    })),
    ...((drvRes.data ?? []) as { id: string; owner: string; deleted_at: string }[]).map((r) => ({
      tabla: "drives", tipo: "Drive", id: r.id, label: `Drive de ${r.owner}`, detalle: "", fecha: r.deleted_at,
    })),
  ].sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Papelera</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Lo que se borra desde el panel llega acá y deja de verse en el sitio, pero no se
          pierde. Podés restaurarlo cuando quieras. El borrado definitivo es la única
          acción sin vuelta atrás.
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-2xl border border-hair-strong p-8 text-center"
          style={{ background: CARD }}
        >
          <p className="font-display text-lg font-semibold text-ink">La papelera está vacía</p>
          <p className="mt-1 text-sm text-ink-soft">No hay nada borrado para restaurar.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-hair">
          <ul className="divide-y divide-hair">
            {items.map((m) => (
              <li
                key={`${m.tabla}-${m.id}`}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink break-anywhere">{m.label}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-mute break-anywhere">
                    {m.tipo}
                    {m.detalle ? ` · ${m.detalle}` : ""}
                    {m.fecha ? ` · borrado el ${fmt(m.fecha)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <DangerForm
                    action={restoreItem}
                    hidden={{ table: m.tabla, id: m.id }}
                    confirm={`¿Restaurar "${m.label}"? Vuelve al panel como borrador o inactivo, para que lo revises antes de publicarlo.`}
                    label="Restaurar"
                    className="btn btn-ghost text-xs text-emerald-300"
                  />
                  <DangerForm
                    action={purgeItem}
                    hidden={{ table: m.tabla, id: m.id }}
                    confirm={`¿Eliminar "${m.label}" DEFINITIVAMENTE? Esto no se puede deshacer y el dato no se va a poder recuperar.`}
                    label="Eliminar definitivamente"
                    className="btn btn-ghost text-xs text-red-300"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
