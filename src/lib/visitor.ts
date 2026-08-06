/**
 * Identidad anónima del visitante para los informes.
 *
 * Un id aleatorio que vive en el navegador (localStorage). No identifica a la
 * persona (no hay nombre, mail ni IP) y el servidor lo guarda hasheado con sal.
 * Sirve para responder la pregunta clave de los informes: cuántos ESTUDIANTES
 * distintos usan la plataforma, no cuántas visitas hubo.
 */
export function getVisitorId(): string | null {
  try {
    const KEY = "ci_vid";
    let v = localStorage.getItem(KEY);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(KEY, v);
    }
    return v;
  } catch {
    return null; // sin localStorage: el evento cuenta igual, sin identidad persistente
  }
}
