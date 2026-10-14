import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { education, profile } from '../data/resume';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { burstFrom } from '../lib/particles';
import { addCredit, award, pad, useGame } from '../lib/score';
import { sfx } from '../lib/sfx';
import { goToSection } from '../lib/transition';
import { ARCADE_REPLAY, ARCADE_START, bootPending } from './Boot';
import { Skyline } from './fx/Skyline';
import { Icon } from './pixel/PixelArt';
import { Sprite, useSpritePose } from './pixel/Sprite';
import { ev } from './Stage';

const BULBS = 18;
type Tilt = 'none' | 'left' | 'mid' | 'right';
const TILT: Record<Tilt, string> = { none: '0deg', left: '-16deg', mid: '0deg', right: '16deg' };

/**
 * Stage 0: the cabinet. Entrance (after the boot hand-off):
 * scenery rises → cabinet lands → bulbs light in sequence → marquee ignites →
 * screen powers on → text lines → buttons → the player walks in.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const [on, setOn] = useState(false);
  const [walk, setWalk] = useState<'off' | 'walking' | 'idle'>('off');
  const [tilt, setTilt] = useState<Tilt>('none');
  const [coins, setCoins] = useState(0);
  const { credits } = useGame();
  const heroRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLButtonElement>(null);
  const [jumping, setJumping] = useState(false);
  const pose = useSpritePose(walk === 'walking', reduced);

  // Hold the entrance until the boot screen hands over.
  useEffect(() => {
    const start = () => setOn(true);
    const reset = () => {
      setOn(false);
      setWalk('off');
    };
    let t = 0;
    if (!bootPending()) t = window.setTimeout(start, 80);
    window.addEventListener(ARCADE_START, start);
    window.addEventListener(ARCADE_REPLAY, reset);
    return () => {
      clearTimeout(t);
      window.removeEventListener(ARCADE_START, start);
      window.removeEventListener(ARCADE_REPLAY, reset);
    };
  }, []);

  // Player walks onto the screen once the screen is lit.
  useEffect(() => {
    if (!on) return;
    if (reduced) {
      setWalk('idle');
      return;
    }
    const a = window.setTimeout(() => setWalk('walking'), 1850);
    const b = window.setTimeout(() => setWalk('idle'), 1850 + 1100);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [on, reduced]);

  // Pointer + scroll parallax for the scenery layers (CSS vars, one rAF per frame max).
  useEffect(() => {
    const el = heroRef.current!;
    if (reduced) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
      el.style.setProperty('--sy', String(Math.min(window.scrollY, 900)));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      queue();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', queue, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', queue);
    };
  }, [reduced]);

  const insertCoin = () => {
    setCoins((c) => c + 1);
    sfx.coin();
    window.setTimeout(() => {
      addCredit();
      burstFrom(slotRef.current, 12);
    }, reduced ? 0 : 380);
  };

  const jump = () => {
    if (jumping || reduced) return;
    setJumping(true);
    sfx.jump();
    award('egg:jump', 50, 'NICE JUMP');
    window.setTimeout(() => setJumping(false), 460);
  };

  const press = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    sfx.select();
    goToSection(id);
  };

  return (
    <section ref={heroRef} id="start" aria-label="Start" className={`stage hero ${on ? 'is-in' : ''}`}>
      {/* scenery: each layer moves at its own depth */}
      <div className="hero-scene" aria-hidden="true">
        <div className="layer" style={ev({ '--depth': 0.12 })}>
          <div className="hero-sun e" style={ev({ '--enter': 'sun-rise', '--dur': '900ms' })} />
        </div>
        <div className="layer" style={ev({ '--depth': 0.3 })}>
          <div className="e hero-sky-far" style={ev({ '--d': '120ms', '--dur': '700ms' })}>
            <Skyline seed={11} fill="#1c0d4d" windows="#2de2ff" className="h-full w-full" minH={30} maxH={84} />
          </div>
        </div>
        <div className="layer" style={ev({ '--depth': 0.55 })}>
          <div className="e hero-sky-near" style={ev({ '--d': '220ms', '--dur': '700ms' })}>
            <Skyline seed={4} fill="#2a1266" windows="#ffd23f" className="h-full w-full" minH={14} maxH={52} />
          </div>
        </div>
        <div className="grid-floor e" style={ev({ '--d': '300ms', '--dur': '700ms' })}>
          <div className="grid-plane" />
        </div>
        <div className="hero-floor-glow" />
      </div>

      <div className="hero-inner">
        <div className="cabinet e" style={ev({ '--enter': 'cab-land', '--d': '260ms', '--dur': '720ms' })}>
          <div className="cab-light" aria-hidden="true" />
          <div className="cab-body">
            {/* marquee */}
            <div className="cab-marquee">
              <Bulbs row="top" />
              <p className="cab-marquee-text" aria-hidden="true">
                ★ PJ ARCADE ★
              </p>
              <Bulbs row="bottom" />
            </div>

            {/* screen */}
            <div className="cab-bezel">
              <div className="cab-screen">
                <div className="cab-screen-content">
                  <p className="scr-line scr-top" style={ev({ '--d': '1300ms' })}>
                    <span className="text-yellow">PLAYER 1</span>
                    <span className="text-muted">HI-SCORE CHAMP: YOU?</span>
                  </p>
                  <h1 className="scr-line hero-name" style={ev({ '--d': '1400ms' })}>
                    <span className="block">{profile.firstName.toUpperCase()}</span>
                    <span className="block text-cyan">{profile.lastName.toUpperCase()}</span>
                  </h1>
                  <p
                    className="scr-line hero-role"
                    style={ev({ '--d': '1560ms', '--enter': 'type-in', '--ease': `steps(${profile.role.length + 2})`, '--dur': '640ms' })}
                  >
                    &gt; {profile.role}
                    <span className="caret" aria-hidden="true" />
                  </p>
                  <p className="scr-line hero-intro" style={ev({ '--d': '1700ms' })}>
                    {profile.intro}
                  </p>
                  <p className="scr-line hero-meta" style={ev({ '--d': '1780ms' })}>
                    {education.institution} · {education.period}
                  </p>
                </div>

                <div className="scr-ground" aria-hidden="true" />
                <button
                  ref={spriteRef}
                  type="button"
                  className={`hero-sprite is-${walk} ${jumping ? 'is-jumping' : ''}`}
                  onClick={jump}
                  aria-label="Make the player jump"
                  tabIndex={walk === 'off' ? -1 : 0}
                >
                  <Sprite pose={jumping ? 'jump' : pose} className="h-full w-full" />
                </button>
              </div>
            </div>

            {/* control panel */}
            <div className="cab-panel" onMouseLeave={() => setTilt('none')}>
              <div className="joystick" aria-hidden="true" style={{ '--tilt': TILT[tilt] } as CSSProperties}>
                <span className="joy-base" />
                <span className="joy-stick" />
              </div>
              <div className="cab-buttons">
                <ArcadeButton
                  label="PLAY"
                  color="var(--color-pink)"
                  href="#play"
                  onClick={press('play')}
                  onAim={() => setTilt('left')}
                  delay={1950}
                />
                <ArcadeButton
                  label="GAMES"
                  color="var(--color-cyan)"
                  href="#projects"
                  onClick={press('projects')}
                  onAim={() => setTilt('mid')}
                  delay={2040}
                />
                {profile.resumeUrl ? (
                  <ArcadeButton
                    label="RESUME"
                    color="var(--color-yellow)"
                    href={profile.resumeUrl}
                    download="Pooja_Jain_Resume.pdf"
                    onClick={() => sfx.select()}
                    onAim={() => setTilt('right')}
                    delay={2130}
                  />
                ) : (
                  <ArcadeButton
                    label="CONTACT"
                    color="var(--color-yellow)"
                    href="#contact"
                    onClick={press('contact')}
                    onAim={() => setTilt('right')}
                    delay={2130}
                  />
                )}
              </div>
            </div>

            {/* coin door */}
            <div className="cab-door">
              <button ref={slotRef} type="button" className="coin-door-slot" onClick={insertCoin} aria-label="Insert a coin">
                <span className="coin-door-mouth" />
                {coins > 0 && !reduced && (
                  <span key={coins} className="coin-door-coin" aria-hidden="true">
                    <Icon name="coin" className="h-full w-full" />
                  </span>
                )}
                <span className="coin-door-label">INSERT COIN</span>
              </button>
              <span className="coin-door-credit" aria-live="polite">
                CREDIT {pad(credits, 2)}
              </span>
            </div>
          </div>
        </div>

        <a href="#play" onClick={press('play')} className="scroll-hint e" style={ev({ '--d': '2500ms' })}>
          ▼ PRESS PLAY TO OPEN THE STAGES ▼
        </a>
      </div>
    </section>
  );
}

function Bulbs({ row }: { row: 'top' | 'bottom' }) {
  return (
    <span className={`bulbs is-${row}`} aria-hidden="true">
      {Array.from({ length: BULBS }, (_, i) => (
        <i key={i} style={ev({ '--i': i, '--k': i % 3 })} />
      ))}
    </span>
  );
}

function ArcadeButton({
  label,
  color,
  href,
  download,
  onClick,
  onAim,
  delay,
}: {
  label: string;
  color: string;
  href: string;
  download?: string;
  onClick: (e: React.MouseEvent) => void;
  onAim: () => void;
  delay: number;
}) {
  return (
    <a
      href={href}
      download={download}
      onClick={onClick}
      onMouseEnter={onAim}
      onFocus={onAim}
      className="arcade-btn e"
      style={ev({ '--c': color, '--enter': 'pop-in', '--d': `${delay}ms`, '--dur': '380ms' })}
    >
      <span className="arcade-cap" aria-hidden="true" />
      <span className="arcade-label">{label}</span>
    </a>
  );
}
