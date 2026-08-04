/**
 * Fondo del módulo Academia — estética de ingeniería (identidad marcada).
 * Capas apiladas (todas decorativas, `pointer-events: none`):
 *   1. Base metálica (titanio/acero) para evitar el fondo plano.
 *   2. Placas de aluminio/titanio flotantes (profundidad ambiental).
 *   3. Grilla blueprint (dibujo técnico) con tinte azul acero, enmascarada.
 *   4. Líneas diagonales técnicas (mecanizado sutil).
 *   5. Textura de metal cepillado, muy sutil.
 *   6. Reflejo diagonal suave + destello especular (brillo metálico).
 *   7. Luces discretas (acero + azul) para dar profundidad.
 * Los estilos viven namespaced en globals.css (`.academy-*`) y no afectan
 * ninguna otra sección del sitio.
 */
export function AcademyBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="academy-metal-base absolute inset-0" />
      <div className="academy-plate academy-plate--tr absolute" />
      <div className="academy-plate academy-plate--bl absolute" />
      <div className="academy-blueprint absolute inset-0" />
      <div className="academy-diagonals absolute inset-0" />
      <div className="academy-brushed absolute inset-0" />
      <div className="academy-sheen absolute inset-0" />
      <div className="academy-glint absolute inset-0" />
      <div className="academy-glow academy-glow--steel" />
      <div className="academy-glow academy-glow--blue" />
    </div>
  );
}
