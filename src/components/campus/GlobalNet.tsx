"use client";

import { useEffect, useRef } from "react";

/**
 * Identidad de fondo del ecosistema Cursemos: una esfera de red global —
 * nube de nodos y conexiones finas que aparecen/desaparecen, rotación
 * lentísima, profundidad y leve parallax al scrollear. Sobrio, premium y
 * casi imperceptible; siempre detrás del contenido. Base oscura + viñeta para
 * proteger la legibilidad. Respeta prefers-reduced-motion (cuadro estático).
 */
export function GlobalNet() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // La animación se mantiene en TODOS los dispositivos; lo que se adapta es
    // cuánto trabajo cuesta cada cuadro. En pantallas chicas hay menos píxeles,
    // así que con menos nodos se ve igual de densa y corre fluida.
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);

    let W = 0;
    let H = 0;
    let raf = 0;
    let t = 0;
    let scrollY = 0;
    let scrollTarget = 0;

    // Nube de puntos sobre una esfera (distribución de Fibonacci)
    const N = small ? 320 : 620;
    type Pt = { x: number; y: number; z: number; sx: number; sy: number; depth: number; s: number };
    const pts: Pt[] = [];
    const GA = Math.PI * (1 + Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = GA * i;
      pts.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        sx: 0, sy: 0, depth: 0,
        s: 0.6 + Math.random() * 0.8,
      });
    }

    // Conexiones entre nodos cercanos (topología fija, precalculada)
    type Edge = { a: number; b: number; ph: number; sp: number };
    const edges: Edge[] = [];
    const COST = Math.cos(0.3);
    const MAX_LINKS = small ? 3 : 4;
    for (let i = 0; i < N; i++) {
      let cnt = 0;
      for (let j = i + 1; j < N && cnt < MAX_LINKS; j++) {
        const d = pts[i].x * pts[j].x + pts[i].y * pts[j].y + pts[i].z * pts[j].z;
        if (d > COST) {
          edges.push({ a: i, b: j, ph: Math.random() * 6.28, sp: 0.003 + Math.random() * 0.004 });
          cnt++;
        }
      }
    }

    type Star = { x: number; y: number; a: number; ph: number };
    type Fg = { x: number; y: number; z: number; vx: number; vy: number };
    let stars: Star[] = [];
    let fg: Fg[] = [];

    let cx = 0;
    let cy = 0;
    let Rd = 0;

    // Los gradientes son lo más caro de este dibujo. Antes se creaban tres por
    // cuadro (180 por segundo); ahora se arman una vez y se reutilizan.
    let gBg: CanvasGradient | null = null;
    let gAura: CanvasGradient | null = null;
    let gHalo: CanvasGradient | null = null;
    let gVig: CanvasGradient | null = null;

    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * 0.5;
      cy = H * 0.52;
      Rd = Math.min(W, H) * 0.62;
      stars = Array.from({ length: Math.round((W * H) / 9000) }, () => ({
        x: Math.random() * W, y: Math.random() * H, a: 0.1 + Math.random() * 0.4, ph: Math.random() * 6.28,
      }));
      fg = Array.from({ length: 26 }, () => ({
        x: Math.random() * W, y: Math.random() * H, z: Math.random(),
        vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.08,
      }));

      // Base: grafito azulado en vez de casi negro — da aire sin lavar el texto.
      gBg = ctx.createLinearGradient(0, 0, 0, H);
      gBg.addColorStop(0, "#080d1c");
      gBg.addColorStop(0.55, "#0a1226");
      gBg.addColorStop(1, "#070c1a");

      // Aura de la esfera: más intensa y con azul más vivo.
      // Se dibuja centrada en cy; el parallax se resuelve moviendo el lienzo.
      gAura = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rd * 1.5);
      gAura.addColorStop(0, "rgba(58,110,235,0.34)");
      gAura.addColorStop(0.45, "rgba(38,78,180,0.16)");
      gAura.addColorStop(1, "rgba(0,0,0,0)");

      // Segundo halo, cian y descentrado: el matiz que aporta la vibración.
      gHalo = ctx.createRadialGradient(
        W * 0.72, cy - Rd * 0.35, 0,
        W * 0.72, cy - Rd * 0.35, Rd * 1.15,
      );
      gHalo.addColorStop(0, "rgba(70,180,240,0.20)");
      gHalo.addColorStop(0.5, "rgba(60,120,220,0.08)");
      gHalo.addColorStop(1, "rgba(0,0,0,0)");

      // Viñeta más suave: sigue protegiendo la lectura en los bordes,
      // pero deja de apagar el centro.
      gVig = ctx.createRadialGradient(
        W * 0.5, H * 0.44, Math.min(W, H) * 0.3,
        W * 0.5, H * 0.44, Math.max(W, H) * 0.92,
      );
      gVig.addColorStop(0, "rgba(4,6,14,0)");
      gVig.addColorStop(1, "rgba(3,5,12,0.55)");
    };

    const draw = () => {
      scrollY += (scrollTarget - scrollY) * 0.06;
      const par = Math.min(scrollY, 2200) * 0.028;
      const ccy = cy - par;

      if (gBg) {
        ctx.fillStyle = gBg;
        ctx.fillRect(0, 0, W, H);
      }

      // El aura acompaña el parallax desplazando el lienzo, no recreándose.
      if (gAura) {
        ctx.save();
        ctx.translate(0, -par);
        ctx.fillStyle = gAura;
        ctx.fillRect(0, par, W, H);
        if (gHalo) {
          ctx.fillStyle = gHalo;
          ctx.fillRect(0, par, W, H);
        }
        ctx.restore();
      }

      ctx.globalCompositeOperation = "lighter";

      for (const s of stars) {
        const a = s.a * (0.5 + 0.5 * Math.sin(t * 0.01 + s.ph));
        ctx.fillStyle = `rgba(200,220,255,${a * 0.5})`;
        ctx.fillRect(s.x, s.y - par * 0.5, 1, 1);
      }

      // Proyección de la esfera (rotación Y lentísima + inclinación fija)
      const ang = t * 0.00033;
      const tilt = -0.42;
      const ct = Math.cos(tilt);
      const stlt = Math.sin(tilt);
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const persp = 2.6;
      for (const p of pts) {
        const rx = p.x * ca + p.z * sa;
        const rz = -p.x * sa + p.z * ca;
        const ry = p.y;
        const ry2 = ry * ct - rz * stlt;
        const rz2 = ry * stlt + rz * ct;
        const sc = persp / (persp - rz2);
        p.sx = cx + rx * Rd * sc;
        p.sy = ccy + ry2 * Rd * sc;
        p.depth = (rz2 + 1) / 2;
      }

      for (const e of edges) {
        const a = pts[e.a];
        const b = pts[e.b];
        const depth = (a.depth + b.depth) / 2;
        const fade = 0.5 + 0.5 * Math.sin(t * e.sp + e.ph);
        const o = depth * depth * 0.34 * fade;
        if (o < 0.012) continue;
        ctx.strokeStyle = `rgba(150,190,255,${o})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      for (const p of pts) {
        const a = 0.2 + p.depth * p.depth * 0.8;
        const r = p.s * (0.55 + p.depth * 1.2);
        ctx.fillStyle = `rgba(216,234,255,${a})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, 6.283);
        ctx.fill();
      }

      for (const f of fg) {
        if (!reduce) {
          f.x += f.vx;
          f.y += f.vy;
          if (f.x < 0) f.x = W; else if (f.x > W) f.x = 0;
          if (f.y < 0) f.y = H; else if (f.y > H) f.y = 0;
        }
        const yy = f.y - par * (1 + f.z);
        const a = 0.1 + f.z * 0.22;
        const r = 0.6 + f.z * 1.4;
        ctx.fillStyle = `rgba(180,205,255,${a})`;
        ctx.beginPath();
        ctx.arc(f.x, yy, r, 0, 6.283);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      if (gVig) {
        ctx.fillStyle = gVig;
        ctx.fillRect(0, 0, W, H);
      }

      t++;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      scrollTarget = window.scrollY || window.pageYOffset || 0;
    };

    size();
    draw();
    window.addEventListener("resize", size);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  );
}
