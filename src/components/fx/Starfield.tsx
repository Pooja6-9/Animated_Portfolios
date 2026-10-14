import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Star = { x: number; y: number; layer: number; tw: number; c: string };

const LAYERS = [
  { count: 70, speed: 0.04, size: 1, alpha: 0.45 },
  { count: 36, speed: 0.12, size: 1, alpha: 0.75 },
  { count: 12, speed: 0.26, size: 2, alpha: 1 },
];
const TINTS = ['#ffffff', '#ffffff', '#c9f7ff', '#ffc2e0', '#fff3a8'];
const SCALE = 2; // canvas renders at half resolution, upscaled with crisp pixels

/**
 * Fixed, three-layer pixel starfield. Layers drift at different speeds against
 * the page scroll (parallax). ~30fps, paused when the tab is hidden; drawn once
 * for reduced motion.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let last = 0;

    const seed = () => {
      w = Math.ceil(window.innerWidth / SCALE);
      h = Math.ceil(window.innerHeight / SCALE);
      canvas.width = w;
      canvas.height = h;
      stars = LAYERS.flatMap((l, layer) =>
        Array.from({ length: Math.round(l.count * Math.min(1.4, (w * h) / 180000 + 0.5)) }, (_, i) => ({
          x: Math.random() * w,
          y: Math.random() * h,
          layer,
          tw: i % 4 === 0 ? 0.6 + Math.random() * 2 : 0,
          c: TINTS[i % TINTS.length],
        })),
      );
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const sy = reduced ? 0 : window.scrollY / SCALE;
      for (const s of stars) {
        const l = LAYERS[s.layer];
        const y = (((s.y - sy * l.speed) % h) + h) % h;
        const a = s.tw && !reduced ? l.alpha * (0.45 + 0.55 * Math.abs(Math.sin(t / 1000 * s.tw + s.x))) : l.alpha;
        ctx.globalAlpha = a;
        ctx.fillStyle = s.c;
        ctx.fillRect(Math.round(s.x), Math.round(y), l.size, l.size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 33) return;
      last = t;
      draw(t);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    const onResize = () => {
      seed();
      draw(performance.now());
    };

    seed();
    draw(0);
    if (!reduced) raf = requestAnimationFrame(loop);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
