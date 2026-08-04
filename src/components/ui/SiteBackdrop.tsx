/**
 * Lienzo global luminoso del sitio — fijo y continuo (sin cortes entre secciones).
 * Base grafito (menos negra) + grilla blueprint azulada + campo de luces
 * (azul, acero, blancas). Al scrollear, el contenido pasa por las luces.
 * Decorativo, detrás de todo (`-z-10`).
 */
export function SiteBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="site-base absolute inset-0" />
      <div className="site-grid absolute inset-0" />

      {/* Campo de luces (fijas) */}
      <div
        className="site-glow"
        style={{
          width: "56vw",
          height: "56vw",
          top: "-12%",
          left: "-6%",
          background: "radial-gradient(circle, rgba(46,107,255,0.30), transparent 66%)",
        }}
      />
      <div
        className="site-glow"
        style={{
          width: "46vw",
          height: "46vw",
          top: "22%",
          right: "-12%",
          background: "radial-gradient(circle, rgba(186,200,228,0.16), transparent 68%)",
        }}
      />
      <div
        className="site-glow"
        style={{
          width: "50vw",
          height: "50vw",
          bottom: "-16%",
          left: "16%",
          background: "radial-gradient(circle, rgba(59,107,255,0.22), transparent 66%)",
        }}
      />
      <div
        className="site-glow"
        style={{
          width: "34vw",
          height: "34vw",
          top: "58%",
          left: "-10%",
          background: "radial-gradient(circle, rgba(205,218,242,0.12), transparent 70%)",
        }}
      />

      <div className="site-sheen absolute inset-0" />
    </div>
  );
}
