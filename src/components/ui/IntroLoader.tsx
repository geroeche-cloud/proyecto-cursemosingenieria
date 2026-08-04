"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

const ease = [0.16, 1, 0.3, 1] as const;

/** Golpe cinematográfico sintetizado (Web Audio) — impacto grave + riser metálico + brillo. */
function playCue(ctx: AudioContext) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.45;
  master.connect(ctx.destination);

  // Impacto grave
  const boom = ctx.createOscillator();
  boom.type = "sine";
  boom.frequency.setValueAtTime(150, now);
  boom.frequency.exponentialRampToValueAtTime(42, now + 0.9);
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, now);
  bg.gain.exponentialRampToValueAtTime(0.9, now + 0.06);
  bg.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
  boom.connect(bg).connect(master);
  boom.start(now);
  boom.stop(now + 1.6);

  // Riser metálico (ruido filtrado ascendente)
  const size = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(500, now);
  bp.frequency.exponentialRampToValueAtTime(7000, now + 1.5);
  bp.Q.value = 0.9;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, now);
  ng.gain.exponentialRampToValueAtTime(0.14, now + 1.2);
  ng.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
  noise.connect(bp).connect(ng).connect(master);
  noise.start(now);
  noise.stop(now + 1.9);

  // Brillo (acorde que florece)
  [523.25, 784, 1046].forEach((f) => {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now + 0.5);
    g.gain.exponentialRampToValueAtTime(0.06, now + 1.0);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
    o.connect(g).connect(master);
    o.start(now + 0.5);
    o.stop(now + 2.0);
  });

  window.setTimeout(() => {
    try {
      ctx.close();
    } catch {
      /* noop */
    }
  }, 2200);
}

/** Intenta reproducir el sonido al cargar; si el navegador lo bloquea, lo dispara en el primer gesto. */
function armCue() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;

  let ctx: AudioContext;
  try {
    ctx = new AC();
  } catch {
    return;
  }

  let fired = false;
  const events = ["pointerdown", "touchstart", "keydown", "click"] as const;

  const cleanup = () =>
    events.forEach((e) => window.removeEventListener(e, onGesture, true));

  const fire = () => {
    if (fired) return;
    fired = true;
    playCue(ctx);
    try {
      navigator.vibrate?.([45, 30, 120]);
    } catch {
      /* sin soporte de vibración */
    }
    cleanup();
  };

  const onGesture = () => {
    ctx.resume().then(fire).catch(() => {
      /* noop */
    });
  };

  // Intento inmediato (funciona si el navegador permite autoplay)
  ctx.resume().then(() => {
    if (ctx.state === "running") fire();
  }).catch(() => {
    /* bloqueado: esperamos el primer gesto */
  });

  // Fallback: primer gesto del usuario
  events.forEach((e) => window.addEventListener(e, onGesture, true));

  // Limpieza de seguridad
  window.setTimeout(() => {
    cleanup();
    if (!fired) {
      try {
        ctx.close();
      } catch {
        /* noop */
      }
    }
  }, 9000);
}

/**
 * Intro de entrada — logo E metálico + wordmark, con brillo azul, textura
 * industrial, golpe cinematográfico y vibración. Se reproduce una vez por sesión.
 */
export function IntroLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ei-intro")) {
        setShow(false);
        return;
      }
      sessionStorage.setItem("ei-intro", "1");
    } catch {
      /* sin sessionStorage: se muestra igual */
    }
    armCue();
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease }}
          className="brushed-metal fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          aria-hidden
        >
          {/* blue glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 1.2, ease }}
            className="pointer-events-none absolute h-[42vmin] w-[42vmin] rounded-full blur-[80px]"
            style={{ background: "radial-gradient(circle, rgba(59,107,255,0.55), transparent 70%)" }}
          />
          {/* subtle grid */}
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />

          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.82, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.85, ease }}
            >
              <Image
                src="/images/cursemos-logo.png"
                alt="Cursemos Ingeniería"
                width={896}
                height={667}
                priority
                unoptimized
                className="h-auto w-60 sm:w-80"
              />
            </motion.div>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55, ease }}
              className="metal-divider mt-7 w-40 origin-center sm:w-52"
            />

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ink-mute"
            >
              Est. 2026
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
