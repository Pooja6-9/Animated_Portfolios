import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { award } from '../lib/score';
import { sfx } from '../lib/sfx';
import { burstFrom } from '../lib/particles';
import { prefersReducedMotion } from '../lib/store';
import { goToSection } from '../lib/transition';
import { GATED, unlock, useUnlocked } from '../lib/unlock';

export const ev = (vars: Record<string, string | number>) => vars as CSSProperties;

/**
 * Section shell. Adds `is-in` the first time the section is on screen; every
 * `.e` child then plays its entrance (configured with --enter / --d / --dur).
 * Gated stages show a locked door until opened from the World Map (or the door itself).
 */
export function Stage({
  id,
  n,
  className = '',
  children,
  label,
  threshold = 0.18,
}: {
  id: string;
  n?: number;
  className?: string;
  children: ReactNode;
  label: string;
  threshold?: number;
}) {
  const open = useUnlocked();
  const locked = (GATED as readonly string[]).includes(id) && !open.includes(id);
  const [ref, inView] = useInView<HTMLElement>(threshold);
  useEffect(() => {
    if (inView && !locked) award(`stage:${id}`, 500, `${label} OPEN`);
  }, [inView, locked, id, label]);
  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      className={`stage ${inView ? 'is-in' : ''} ${locked ? 'is-locked' : ''} ${locked ? '' : className}`}
    >
      {locked ? <Gate id={id} n={n ?? 0} label={label} /> : children}
    </section>
  );
}

function Gate({ id, n, label }: { id: string; n: number; label: string }) {
  const [opening, setOpening] = useState(false);
  const doorRef = useRef<HTMLDivElement>(null);
  const open = () => {
    if (opening) return;
    sfx.unlock();
    const finish = () => {
      unlock(id);
      // the door button is gone now; keep keyboard focus at the top of the opened stage
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        el?.setAttribute('tabindex', '-1');
        el?.focus({ preventScroll: true });
      });
    };
    if (prefersReducedMotion()) return finish();
    setOpening(true);
    burstFrom(doorRef.current, 18);
    window.setTimeout(finish, 620);
  };
  return (
    <div className={`gate ${opening ? 'is-opening' : ''}`}>
      <div ref={doorRef} className="gate-door" aria-hidden="true">
        <span className="gate-leaf is-l" />
        <span className="gate-leaf is-r" />
        <span className="gate-light" />
        <span className="gate-lock">
          <Lock className="h-5 w-5" />
        </span>
      </div>
      <div className="gate-copy">
        <p className="stage-kicker">
          <span className="stage-num">STAGE {String(n).padStart(2, '0')}</span> · LOCKED
        </p>
        <h2 className="gate-title">{label}</h2>
        <p className="gate-text">Walk to this door on the World Map and press ▲ to enter, or open it right here.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="px-btn is-pink" onClick={open}>
            OPEN DOOR
          </button>
          <a
            href="#play"
            className="px-btn is-ghost"
            onClick={(e) => {
              e.preventDefault();
              goToSection('play');
            }}
          >
            PLAY THE MAP
          </a>
        </div>
      </div>
    </div>
  );
}

export function StageHeader({
  n,
  title,
  kicker,
  subtitle,
  align = 'center',
}: {
  n: number;
  title: string;
  kicker: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const typeMs = Math.min(600, title.length * 45);
  return (
    <header className={`stage-head ${align === 'left' ? 'is-left' : ''}`}>
      <p className="stage-kicker e" style={ev({ '--enter': 'step-in', '--dur': '260ms' })}>
        <span className="stage-num">STAGE {String(n).padStart(2, '0')}</span>
        <span aria-hidden="true">·</span>
        <span>{kicker}</span>
      </p>
      <h2 className="stage-title e" style={ev({ '--enter': 'type-in', '--dur': `${typeMs}ms`, '--ease': `steps(${title.length})`, '--d': '140ms' })}>
        {title}
      </h2>
      {subtitle && (
        <p className="stage-sub e" style={ev({ '--d': `${200 + typeMs}ms` })}>
          {subtitle}
        </p>
      )}
    </header>
  );
}

/** Dithered pixel band between stages; builds left to right when reached. */
export function PixelDivider({ tone = 'pink' }: { tone?: 'pink' | 'cyan' | 'yellow' }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.6);
  return <div ref={ref} className={`px-divider tone-${tone} ${inView ? 'is-in' : ''}`} aria-hidden="true" />;
}
