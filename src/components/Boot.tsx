import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '../data/resume';
import { addCredit, pad, useGame } from '../lib/score';
import { sfx, toggleSound, useSound } from '../lib/sfx';
import { burstFrom } from '../lib/particles';
import { prefersReducedMotion, safeStorage } from '../lib/store';
import { runWipe } from '../lib/transition';
import { Icon } from './pixel/PixelArt';

export const ARCADE_START = 'arcade:start';
export const ARCADE_REPLAY = 'arcade:replay';
const BOOT_KEY = 'pj-arcade-booted';

let pending: boolean | null = null;
/** Whether the boot screen will run on this page load (read by the hero to hold its entrance). */
export function bootPending() {
  if (pending === null) {
    const deepLink = location.hash && location.hash !== '#start';
    pending = !prefersReducedMotion() && !deepLink && !safeStorage('session')?.getItem(BOOT_KEY);
  }
  return pending;
}

export function replayBoot() {
  if (prefersReducedMotion()) return;
  pending = true;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  window.dispatchEvent(new Event(ARCADE_REPLAY));
}

type Phase = 'off' | 'power' | 'bios' | 'title' | 'coin' | 'insert' | 'ready';

const BIOS = [
  ['PJ-ARCADE BIOS v2.6', '(C) 2026'],
  ['CPU', 'B.TECH CSE · JECRC'],
  ['MEMORY TEST', '640K OK'],
  ['LOADING SPRITES', 'OK'],
  ['LOADING 3 GAMES', 'OK'],
  ['PLAYER 1', profile.name.toUpperCase()],
];

// ms from mount. Short beats with a deliberate pause before the title and the coin prompt.
const T = { power: 120, bios: 620, line: 150, title: 1650, coin: 2250 };

export function Boot() {
  const [run, setRun] = useState(() => (bootPending() ? 1 : 0));

  useEffect(() => {
    const onReplay = () => setRun((r) => r + 1);
    window.addEventListener(ARCADE_REPLAY, onReplay);
    return () => window.removeEventListener(ARCADE_REPLAY, onReplay);
  }, []);

  const done = useCallback(() => {
    pending = false;
    safeStorage('session')?.setItem(BOOT_KEY, '1');
    setRun(0);
    window.dispatchEvent(new Event(ARCADE_START));
  }, []);

  if (!run) return null;
  return <BootScreen key={run} onDone={done} />;
}

function BootScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('off');
  const [lines, setLines] = useState(0);
  const timers = useRef<number[]>([]);
  const leaving = useRef(false);
  const coinRef = useRef<HTMLButtonElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const soundOn = useSound();
  const { credits } = useGame();

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    clear();
    runWipe(onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);

  const toCoin = () => {
    clear();
    setLines(BIOS.length);
    setPhase('coin');
  };

  const insertCoin = useCallback(() => {
    if (leaving.current) return;
    clear();
    setLines(BIOS.length);
    setPhase('insert');
    sfx.coin();
    later(() => {
      addCredit();
      burstFrom(slotRef.current, 14);
    }, 420);
    later(() => {
      setPhase('ready');
      sfx.start();
    }, 700);
    later(leave, 1250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leave]);

  // Timeline, scroll lock, keyboard.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    later(() => setPhase('power'), T.power);
    later(() => setPhase('bios'), T.bios);
    BIOS.forEach((_, i) => later(() => setLines(i + 1), T.bios + 120 + i * T.line));
    later(() => setPhase('title'), T.title);
    later(() => setPhase('coin'), T.coin);
    return () => {
      clear();
      html.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'coin') coinRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave();
      else if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) toggleSound();
      else if (e.key === 'Enter' || e.key === ' ') {
        if (phase === 'coin') return; // the focused coin button handles it
        e.preventDefault();
        if (phase !== 'insert' && phase !== 'ready') toCoin();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, leave]);

  const past = (p: Phase) => {
    const order: Phase[] = ['off', 'power', 'bios', 'title', 'coin', 'insert', 'ready'];
    return order.indexOf(phase) >= order.indexOf(p);
  };

  return (
    <div
      className={`boot phase-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Arcade start screen"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !past('coin')) toCoin();
      }}
    >
      <div className="boot-tube">
        <div className="boot-screen" onPointerDown={() => !past('coin') && toCoin()}>
          {past('bios') && (
            <ol className="boot-bios" aria-hidden={past('title')}>
              {BIOS.slice(0, lines).map(([k, v]) => (
                <li key={k}>
                  <span>{k}</span>
                  <span className="boot-dots" />
                  <span className="text-green">{v}</span>
                </li>
              ))}
            </ol>
          )}

          {past('title') && (
            <div className="boot-title">
              <p className="boot-kicker">★ PORTFOLIO ARCADE ★</p>
              <h1 className="boot-name">
                <span>{profile.firstName.toUpperCase()}</span> <span>{profile.lastName.toUpperCase()}</span>
              </h1>
              <p className="boot-role">{profile.role}</p>
            </div>
          )}

          {past('coin') && (
            <div className="boot-coin">
              <button
                ref={coinRef}
                type="button"
                className="coin-button"
                onClick={(e) => {
                  e.stopPropagation();
                  insertCoin();
                }}
                disabled={past('insert')}
              >
                <span className="coin-slot" ref={slotRef}>
                  <span className="coin-sprite" aria-hidden="true">
                    <Icon name="coin" className="h-full w-full" />
                  </span>
                </span>
                <span className="coin-label">{phase === 'ready' ? 'PLAYER 1 START!' : phase === 'insert' ? 'COIN ACCEPTED' : 'INSERT COIN'}</span>
              </button>
              <p className="boot-hint">
                {phase === 'coin' ? (
                  <>
                    PRESS <kbd>ENTER</kbd> OR TAP THE COIN
                  </>
                ) : (
                  'GET READY'
                )}
              </p>
            </div>
          )}

          <div className="boot-foot" aria-live="polite">
            <span>CREDIT {pad(credits, 2)}</span>
          </div>
        </div>
      </div>

      <div className="boot-controls">
        <button type="button" className="px-btn is-ghost" onClick={toggleSound} aria-pressed={soundOn}>
          SOUND {soundOn ? 'ON' : 'OFF'}
        </button>
        <button type="button" className="px-btn is-ghost" onClick={leave}>
          SKIP <span className="opacity-60">[ESC]</span>
        </button>
      </div>
    </div>
  );
}
