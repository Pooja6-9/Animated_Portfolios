import { useMemo, type CSSProperties } from 'react';
import { useWipe } from '../../lib/transition';

const BLOCK = 72;
const SPREAD = 220; // ms from first block to last

/** Full-screen block wipe used for boot hand-off and every stage jump. */
export function PixelWipe() {
  const { phase, id } = useWipe();

  const blocks = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const cols = Math.ceil(window.innerWidth / BLOCK);
    const rows = Math.ceil(window.innerHeight / BLOCK);
    const max = cols + rows - 2 || 1;
    return Array.from({ length: cols * rows }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return { d: Math.round(((c + r) / max) * SPREAD), accent: (c * 7 + r * 3) % 11 === 0 };
    });
    // recompute grid for every new wipe so it fits the current viewport
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (phase === 'idle') return null;
  return (
    <div
      className={`wipe is-${phase}`}
      style={{ '--cols': Math.ceil(window.innerWidth / BLOCK) } as CSSProperties}
      aria-hidden="true"
    >
      {blocks.map((b, i) => (
        <span key={i} className={b.accent ? 'is-accent' : undefined} style={{ animationDelay: `${b.d}ms` }} />
      ))}
    </div>
  );
}
