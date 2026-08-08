/**
 * Golpe cinematográfico sintetizado (Web Audio) — impacto grave + riser
 * metálico + brillo. Se carga con import() diferido desde IntroSonido, así
 * nada de esto forma parte del arranque de la página.
 */

function reproducir(ctx: AudioContext) {
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
  ng.gain.exponentialRampToValueAtTime(0.12, now + 1.2);
  ng.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
  noise.connect(bp).connect(ng).connect(master);
  noise.start(now);
  noise.stop(now + 2);

  // Brillo agudo
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(1800, now + 0.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now + 0.5);
  g.gain.exponentialRampToValueAtTime(0.06, now + 1.0);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
  o.connect(g).connect(master);
  o.start(now + 0.5);
  o.stop(now + 2.0);

  window.setTimeout(() => {
    try {
      ctx.close();
    } catch {
      /* noop */
    }
  }, 2200);
}

/**
 * Intenta reproducir al cargar; si el navegador bloquea el autoplay (que es lo
 * habitual), queda esperando el primer gesto de la persona.
 */
export function armarGolpe() {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;

  let ctx: AudioContext;
  try {
    ctx = new AC();
  } catch {
    return;
  }

  let sonado = false;
  const eventos = ["pointerdown", "touchstart", "keydown", "click"] as const;

  const limpiar = () => eventos.forEach((e) => window.removeEventListener(e, alGesto, true));

  const sonar = (porGesto: boolean) => {
    if (sonado) return;
    sonado = true;
    reproducir(ctx);
    // Vibrar sin que la persona haya tocado nada lo bloquea el navegador y
    // ensucia la consola con un error. Solo se intenta si hubo gesto.
    if (porGesto) {
      try {
        navigator.vibrate?.([45, 30, 120]);
      } catch {
        /* sin soporte de vibración */
      }
    }
    limpiar();
  };

  const alGesto = () => {
    ctx
      .resume()
      .then(() => sonar(true))
      .catch(() => {
        /* noop */
      });
  };

  ctx
    .resume()
    .then(() => {
      if (ctx.state === "running") sonar(false);
    })
    .catch(() => {
      /* bloqueado: esperamos el primer gesto */
    });

  eventos.forEach((e) => window.addEventListener(e, alGesto, true));

  window.setTimeout(() => {
    limpiar();
    if (!sonado) {
      try {
        ctx.close();
      } catch {
        /* noop */
      }
    }
  }, 9000);
}
