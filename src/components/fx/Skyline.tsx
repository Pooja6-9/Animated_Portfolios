import { memo, useMemo } from 'react';

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Procedural pixel skyline. Deterministic per seed, a few windows blink. */
export const Skyline = memo(function Skyline({
  seed,
  fill,
  windows = '#ffd23f',
  width = 320,
  height = 90,
  minH = 18,
  maxH = 80,
  className = '',
}: {
  seed: number;
  fill: string;
  windows?: string;
  width?: number;
  height?: number;
  minH?: number;
  maxH?: number;
  className?: string;
}) {
  const { buildings, lights } = useMemo(() => {
    const r = rng(seed);
    const buildings: { x: number; w: number; h: number }[] = [];
    const lights: { x: number; y: number; blink: boolean; d: number }[] = [];
    let x = 0;
    let blinkers = 0;
    while (x < width) {
      const w = 10 + Math.floor(r() * 22);
      const h = minH + Math.floor(r() * (maxH - minH));
      buildings.push({ x, w, h });
      for (let wy = height - h + 4; wy < height - 3; wy += 5) {
        for (let wx = x + 2; wx < x + w - 2; wx += 4) {
          if (r() < 0.16) {
            const blink = blinkers < 10 && r() < 0.12;
            if (blink) blinkers++;
            lights.push({ x: wx, y: wy, blink, d: Math.round(r() * 6000) });
          }
        }
      }
      x += w + (r() < 0.3 ? 2 : 0);
    }
    return { buildings, lights };
  }, [seed, width, height, minH, maxH]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {buildings.map((b, i) => (
        <rect key={i} x={b.x} y={height - b.h} width={b.w} height={b.h} fill={fill} />
      ))}
      {lights.map((l, i) => (
        <rect
          key={`l${i}`}
          x={l.x}
          y={l.y}
          width={2}
          height={2}
          fill={windows}
          opacity={l.blink ? undefined : 0.55}
          className={l.blink ? 'win-blink' : undefined}
          style={l.blink ? { animationDelay: `${l.d}ms` } : undefined}
        />
      ))}
    </svg>
  );
});
