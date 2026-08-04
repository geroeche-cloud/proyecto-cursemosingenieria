"use client";

import { useEffect, useRef } from "react";

/**
 * Título con lucecitas que convergen hacia la palabra y la hacen "latir":
 * partículas azules/blancas entran desde los bordes y, al llegar, disparan un
 * pulso de brillo/escala sobre el texto. Mantiene la estética metálica del sitio.
 * Canvas propio, sin libs. Respeta prefers-reduced-motion.
 */
export function SparkTitle({ text, className }: { text: string; className?: string }) {
  const wrapRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !textEl || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const PAD = 30;

    let W = 0;
    let H = 0;
    let raf = 0;
    let pulse = 0;
    let spawnT = 0;

    type P = { x: number; y: number; tx: number; ty: number; k: number; c: string; arrived: boolean; flash: number };
    let parts: P[] = [];

    const size = () => {
      const ow = textEl.offsetWidth;
      const oh = textEl.offsetHeight;
      W = ow + PAD * 2;
      H = oh + PAD * 2;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      canvas.style.left = `${-PAD}px`;
      canvas.style.top = `${-PAD}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => {
      const tx = PAD + Math.random() * (W - 2 * PAD);
      const ty = PAD + Math.random() * (H - 2 * PAD);
      const side = Math.floor(Math.random() * 4);
      const m = 14;
      let x = 0;
      let y = 0;
      if (side === 0) { x = Math.random() * W; y = -m; }
      else if (side === 1) { x = W + m; y = Math.random() * H; }
      else if (side === 2) { x = Math.random() * W; y = H + m; }
      else { x = -m; y = Math.random() * H; }
      parts.push({
        x, y, tx, ty,
        k: 0.045 + Math.random() * 0.03,
        c: Math.random() < 0.5 ? "205,225,255" : "150,190,255",
        arrived: false,
        flash: 0,
      });
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      spawnT++;
      if (spawnT > 26 + Math.random() * 26) {
        spawnT = 0;
        if (parts.length < 8) spawn();
      }

      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        if (!p.arrived) {
          p.x += (p.tx - p.x) * p.k;
          p.y += (p.ty - p.y) * p.k;
          if (Math.hypot(p.tx - p.x, p.ty - p.y) < 3) {
            p.arrived = true;
            p.flash = 1;
            pulse = Math.min(1, pulse + 0.34);
          }
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3.4);
          g.addColorStop(0, `rgba(${p.c},0.6)`);
          g.addColorStop(1, `rgba(${p.c},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.4, 0, 6.283);
          ctx.fill();
        } else {
          const r = 4 + (1 - p.flash) * 9;
          const g = ctx.createRadialGradient(p.tx, p.ty, 0, p.tx, p.ty, r);
          g.addColorStop(0, `rgba(225,238,255,${0.45 * p.flash})`);
          g.addColorStop(1, "rgba(180,205,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.tx, p.ty, r, 0, 6.283);
          ctx.fill();
          p.flash -= 0.09;
        }
      }
      parts = parts.filter((p) => !p.arrived || p.flash > 0);
      ctx.globalCompositeOperation = "source-over";

      pulse *= 0.9;
      textEl.style.transform = `scale(${1 + pulse * 0.006})`;
      textEl.style.filter = `drop-shadow(0 0 ${3 + pulse * 9}px rgba(150,185,255,${0.12 + pulse * 0.26}))`;

      raf = requestAnimationFrame(frame);
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(textEl);
    window.addEventListener("resize", size);

    if (!reduce) {
      for (let i = 0; i < 2; i++) spawn();
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <h2 ref={wrapRef} className="relative inline-flex">
      <span ref={textRef} className={className} style={{ display: "inline-block", willChange: "transform" }}>
        {text}
      </span>
      <canvas ref={canvasRef} className="pointer-events-none absolute" aria-hidden />
    </h2>
  );
}
