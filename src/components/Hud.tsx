import { useEffect, useRef, useState } from 'react';
import { Menu, Volume2, VolumeX, X } from 'lucide-react';
import { useActiveSection } from '../hooks/useActiveSection';
import { pad, useGame } from '../lib/score';
import { sfx, toggleSound, useSound } from '../lib/sfx';
import { goToSection } from '../lib/transition';

export const STAGES = [
  { id: 'start', label: 'START' },
  { id: 'play', label: 'MAP' },
  { id: 'about', label: 'ABOUT' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'experience', label: 'QUESTS' },
  { id: 'projects', label: 'GAMES' },
  { id: 'achievements', label: 'TROPHIES' },
  { id: 'contact', label: 'CONTINUE' },
];
const IDS = STAGES.map((s) => s.id);

/** Counts up to `value` over ~450ms so score changes read as a tally, not a jump. */
function useRolling(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 450);
      const v = Math.round(a + (value - a) * (1 - (1 - k) ** 3));
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return shown;
}

export function Hud() {
  const { score, hi, credits, toast } = useGame();
  const soundOn = useSound();
  const active = useActiveSection(IDS);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstItem = useRef<HTMLAnchorElement>(null);
  const shown = useRolling(score);
  const shownHi = useRolling(hi);

  useEffect(() => {
    if (!open) return;
    firstItem.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    sfx.select();
    setOpen(false);
    goToSection(id);
  };

  return (
    <header className="hud" data-hud>
      <div className="hud-inner">
        <div className="hud-score" aria-label={`Score ${score}`}>
          <span className="hud-label text-pink">1UP</span>
          <span className="hud-num">{pad(shown)}</span>
          {toast && (
            <span key={toast.id} className="hud-toast" aria-hidden="true">
              +{toast.amount} <span>{toast.label}</span>
            </span>
          )}
        </div>

        <nav className="hud-nav" aria-label="Stage select">
          <ol>
            {STAGES.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={go(s.id)} aria-current={active === s.id ? 'true' : undefined}>
                  <span className="hud-n">{i + 1}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="hud-right">
          <span className="hud-hi">
            <span className="hud-label text-cyan">HI</span>
            <span className="hud-num">{pad(shownHi)}</span>
          </span>
          <span className="hud-credit">CREDIT {pad(credits, 2)}</span>
          <button
            type="button"
            className="hud-icon"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Sound on. Mute' : 'Sound off. Unmute'}
          >
            {soundOn ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            ref={menuBtn}
            type="button"
            className="hud-icon hud-menu-btn"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="stage-menu"
            aria-label="Open stage select"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div id="stage-menu" className="stage-menu" role="dialog" aria-modal="true" aria-label="Stage select">
          <div className="stage-menu-head">
            <p className="font-pixel text-[11px] text-yellow">STAGE SELECT</p>
            <button
              type="button"
              className="hud-icon"
              onClick={() => {
                setOpen(false);
                menuBtn.current?.focus();
              }}
              aria-label="Close stage select"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <ol>
            {STAGES.map((s, i) => (
              <li key={s.id} style={{ animationDelay: `${60 + i * 45}ms` }}>
                <a ref={i === 0 ? firstItem : undefined} href={`#${s.id}`} onClick={go(s.id)} aria-current={active === s.id ? 'true' : undefined}>
                  <span className="hud-n">{i + 1}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
          <p className="stage-menu-hint">TIP: KEYS 1–8 JUMP BETWEEN STAGES</p>
        </div>
      )}
    </header>
  );
}
