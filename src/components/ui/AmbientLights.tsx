/**
 * Ambient light blobs — soft drifting gradients that give the dark
 * background depth. Purely decorative, pointer-events: none.
 */
export function AmbientLights({
  variant = "default",
}: {
  variant?: "default" | "blue" | "subtle";
}) {
  if (variant === "blue") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="ambient animate-drift"
          style={{
            width: "48vw",
            height: "48vw",
            top: "-10%",
            left: "-5%",
            background:
              "radial-gradient(circle, rgba(46,107,255,0.5), transparent 65%)",
          }}
        />
        <div
          className="ambient animate-drift-slow"
          style={{
            width: "42vw",
            height: "42vw",
            bottom: "-12%",
            right: "-8%",
            background:
              "radial-gradient(circle, rgba(91,140,255,0.32), transparent 68%)",
          }}
        />
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="ambient animate-drift-slow"
          style={{
            width: "50vw",
            height: "50vw",
            top: "20%",
            left: "25%",
            opacity: 0.28,
            background:
              "radial-gradient(circle, rgba(150,164,190,0.35), transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="ambient animate-drift"
        style={{
          width: "46vw",
          height: "46vw",
          top: "-14%",
          left: "8%",
          background:
            "radial-gradient(circle, rgba(46,107,255,0.42), transparent 62%)",
        }}
      />
      <div
        className="ambient animate-drift-slow"
        style={{
          width: "40vw",
          height: "40vw",
          top: "8%",
          right: "-6%",
          background:
            "radial-gradient(circle, rgba(180,192,210,0.28), transparent 66%)",
        }}
      />
      <div
        className="ambient animate-drift"
        style={{
          width: "36vw",
          height: "36vw",
          bottom: "-18%",
          left: "30%",
          animationDelay: "-8s",
          background:
            "radial-gradient(circle, rgba(31,82,224,0.3), transparent 64%)",
        }}
      />
    </div>
  );
}
