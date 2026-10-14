import { memo } from 'react';

export type Palette = Record<string, string>;

type Run = { x: number; y: number; w: number; c: string };

const cache = new Map<string, Run[]>();

/** Turns a character map into horizontal runs so each row is a handful of rects. */
function toRuns(map: string[], palette: Palette): Run[] {
  const key = map.join('|') + JSON.stringify(palette);
  const hit = cache.get(key);
  if (hit) return hit;
  const runs: Run[] = [];
  map.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const c = palette[ch];
      if (!c) {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === ch) w++;
      runs.push({ x, y, w, c });
      x += w;
    }
  });
  cache.set(key, runs);
  return runs;
}

export const PixelArt = memo(function PixelArt({
  map,
  palette,
  className,
  title,
}: {
  map: string[];
  palette: Palette;
  className?: string;
  title?: string;
}) {
  const w = Math.max(...map.map((r) => r.length));
  const h = map.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {toRuns(map, palette).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />
      ))}
    </svg>
  );
});

/* ---------- Icon set (9–10px grids) ---------- */

const GOLD: Palette = { y: '#ffd23f', Y: '#fff3a8', o: '#b9770e', r: '#ff3d9a' };

export const ICONS = {
  coin: {
    map: ['..oooo..', '.oyyyyo.', 'oyYYyyyo', 'oyYyyyyo', 'oyyyyyyo', 'oyyyyyyo', '.oyyyyo.', '..oooo..'],
    palette: GOLD,
  },
  trophy: {
    map: [
      '..yyyyyy..',
      'yyYyyyyyyy',
      'y.Yyyyyy.y',
      'y.Yyyyyy.y',
      '.yyyyyyyy.',
      '..yyyyyy..',
      '....yy....',
      '....yy....',
      '...oooo...',
      '..oooooo..',
    ],
    palette: GOLD,
  },
  star: {
    map: [
      '....y....',
      '....y....',
      '...yYy...',
      'yyyyYyyyy',
      '.yyyyyyy.',
      '..yyyyy..',
      '..yy.yy..',
      '.yy...yy.',
      '.y.....y.',
    ],
    palette: GOLD,
  },
  crown: {
    map: ['y...yy...y', 'yy..yy..yy', 'yyy.yy.yyy', 'yyyyyyyyyy', 'yyrryyrryy', 'yyyyyyyyyy', 'oooooooooo'],
    palette: GOLD,
  },
  heart: {
    map: ['.rr...rr.', 'rRrr.rrrr', 'rRrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'],
    palette: { r: '#ff3d9a', R: '#ffc2e0' },
  },
  scroll: {
    map: [
      '.oooooooo.',
      'owwwwwwwwo',
      '.wkkkkkkw.',
      '.wwwwwwww.',
      '.wkkkkkww.',
      '.wwwwwwww.',
      '.wkkkwrrw.',
      '.wwwwrrrw.',
      'owwwwwrwwo',
      '.oooooooo.',
    ],
    palette: { o: '#9c6b3c', w: '#f6ecd2', k: '#6b5a8c', r: '#ff3d9a' },
  },
  shield: {
    map: [
      'cccccccccc',
      'cCCccccccc',
      'cCcccyyccc',
      'cCccyyyycc',
      'cccccyyccc',
      '.cccccccc.',
      '..cccccc..',
      '...cccc...',
      '....cc....',
    ],
    palette: { c: '#2de2ff', C: '#c9f7ff', y: '#ffd23f' },
  },
  bowl: {
    map: [
      '..wwwwwwwwww..',
      '.wwwrrwwwggww.',
      'bbbbbbbbbbbbbb',
      'bBbbbbbbbbbbbb',
      '.bbbbbbbbbbbb.',
      '..bbbbbbbbbb..',
      '....bbbbbb....',
      '...oooooooo...',
    ],
    palette: { w: '#fff6e0', r: '#ff3d9a', g: '#3dff8a', b: '#2de2ff', B: '#c9f7ff', o: '#1d8fb0' },
  },
} satisfies Record<string, { map: string[]; palette: Palette }>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className, title }: { name: IconName; className?: string; title?: string }) {
  const i = ICONS[name];
  return <PixelArt map={i.map} palette={i.palette} className={className} title={title} />;
}
