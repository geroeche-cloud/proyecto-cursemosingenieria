import { getSessionUser } from "@/lib/auth";
import { PasswordForm } from "./PasswordForm";

export default async function CuentaPage() {
  const user = await getSessionUser();

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-xl font-semibold">Tu cuenta</h2>
        <div className="mt-4 rounded-2xl border border-hair bg-surface p-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-mute">
            Email de acceso
          </p>
          <p className="mt-1 font-mono text-sm text-ink">{user?.email ?? "—"}</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cambiá la contraseña temporal que te creó el equipo por una tuya.
        </p>
        <PasswordForm />
      </section>
    </div>
  );
}
