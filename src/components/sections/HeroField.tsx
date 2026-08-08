"use client";

import { useEffect, useRef } from "react";

/**
 * Red de nodos animada — puntos y líneas azules que derivan y se conectan,
 * reaccionando al cursor. Metáfora viva de "la red". Canvas propio, sin libs.
 * Respeta prefers-reduced-motion (dibuja un cuadro estático).
 */
export function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let points: P[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent
        ? parent.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Los enlaces se calculan entre TODOS los pares, o sea que el costo crece
      // al cuadrado: 96 nodos son ~4.600 comparaciones por cuadro. En un
      // celular eso bloquea el hilo principal. Se baja el techo en pantallas
      // chicas, donde además el efecto casi no se aprecia.
      const techo = width < 768 ? 44 : 88;
      const count = Math.min(techo, Math.max(28, Math.round((width * height) / 22000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.6,
      }));
    };

    const LINK = 132;
    const MOUSE = 180;

    // 30 cuadros por segundo alcanzan de sobra para una deriva lenta, y es la
    // mitad de trabajo que 60. La diferencia no se percibe; el bloqueo del
    // hilo principal sí.
    const PASO = 1000 / 30;
    let ultimo = 0;

    const draw = (t = 0) => {
      if (!reduce) raf = requestAnimationFrame(draw);
      if (t - ultimo < PASO) return;
      ultimo = t;

      ctx.clearRect(0, 0, width, height);

      for (const p of points) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (p.x < -24) p.x = width + 24;
        else if (p.x > width + 24) p.x = -24;
        if (p.y < -24) p.y = height + 24;
        else if (p.y > height + 24) p.y = -24;
      }

      // Enlaces entre nodos cercanos
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const o = (1 - d / LINK) * 0.42;
            ctx.strokeStyle = `rgba(96,134,240,${o})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Enlaces hacia el cursor + nodos
      for (const p of points) {
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const near = dm < MOUSE;
        if (near) {
          const o = (1 - dm / MOUSE) * 0.55;
          ctx.strokeStyle = `rgba(150,185,255,${o})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + (near ? 0.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = near ? "rgba(190,212,255,0.95)" : "rgba(150,178,255,0.5)";
        ctx.fill();
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    // Pausa cuando la pestaña no está a la vista: seguir animando un canvas que
    // nadie mira gasta batería y hilo principal a cambio de nada.
    const onVisibilidad = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) {
        ultimo = 0;
        draw();
      }
    };

    resize();
    // Un cuadro estático de inmediato para que no haya un hueco visual, pero
    // la animación NO arranca durante la carga: se espera a que el navegador
    // termine lo importante. Es el trabajo que más bloqueaba el hilo principal
    // justo cuando se mide la aparición del contenido.
    ctx.clearRect(0, 0, width, height);
    let arrancado = false;
    const arrancar = () => {
      if (arrancado) return;
      arrancado = true;
      draw();
    };
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(arrancar, { timeout: 2500 })
        : undefined;
    const tmr = idle === undefined ? window.setTimeout(arrancar, 900) : undefined;

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVisibilidad);

    return () => {
      cancelAnimationFrame(raf);
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (tmr !== undefined) clearTimeout(tmr);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisibilidad);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
      aria-hidden
    />
  );
}
