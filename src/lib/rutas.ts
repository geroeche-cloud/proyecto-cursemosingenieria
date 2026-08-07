/**
 * Zonas de trabajo: panel del embajador, administración y vista previa.
 *
 * Estas pantallas se usan para producir, no para impresionar. Todo lo que el
 * sitio público hace para verse bien —la intro con sonido, el fondo con luces
 * difuminadas, la transición al cambiar de página— acá es tiempo perdido: el
 * embajador ya decidió entrar, y lo único que quiere es que responda.
 */
export function esZonaDeTrabajo(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/panel") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/preview")
  );
}
