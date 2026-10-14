import { useCallback, useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { pixelBurst } from '../lib/particles';
import { award } from '../lib/score';
import { sfx } from '../lib/sfx';
import { goToSection } from '../lib/transition';
import { GATED, unlock, useUnlocked } from '../lib/unlock';
import { Skyline } from './fx/Skyline';
import { Icon } from './pixel/PixelArt';
import { Sprite, useSpritePose } from './pixel/Sprite';
import { Stage, StageHeader, ev } from './Stage';

const DOORS = [
  { id: 'about', label: 'ABOUT', color: '#3dff8a' },
  { id: 'skills', label: 'SKILLS', color: '#2de2ff' },
  { id: 'experience', label: 'QUESTS', color: '#ffd23f' },
  { id: 'projects', label: 'GAMES', color: '#ff3d9a' },
  { id: 'achievements', label: 'TROPHIES', color: '#ff8a3d' },
  { id: 'contact', label: 'CONTINUE', color: '#b18cff' },
];
const SPEED = 260; // px per second
const NEAR = 30;
const MIN_WORLD = 820; // px; keeps a walkable gap between doors on phones
const slot = (i: number, w: number) => (w * (i + 1)) / (DOORS.length + 1);

/**
 * Stage 1: a tiny playable hub. Walk (← → / A D / on-screen pad), stand at a
 * door and press ▲ / Enter to open that stage. Clicking or tabbing to a door
 * walks there automatically, so it works with mouse, touch and keyboard.
 */
export function WorldMap() {
  const reduced = useReducedMotion();
  const open = useUnlocked();
  const worldRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const coinRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const innerRef = useRef<HTMLDivElement>(null);
  const s = useRef({ x: 0, w: 0, vw: 0, left: false, right: false, target: null as number | null, enterOnArrive: -1, raf: 0, last: 0 });
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [near, setNear] = useState<number | null>(null);
  const [entering, setEntering] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [coins, setCoins] = useState<boolean[]>(() => DOORS.slice(1).map(() => false));
  const coinsRef = useRef(coins);
  coinsRef.current = coins;
  const enteringRef = useRef(entering);
  enteringRef.current = entering;
  const pose = useSpritePose(walking, reduced);

  const place = () => {
    const { x, w, vw } = s.current;
    // On narrow screens the world is wider than the window: the camera follows the player.
    const cam = Math.max(0, Math.min(w - vw, x - vw / 2));
    if (innerRef.current) innerRef.current.style.transform = `translate3d(${-cam}px,0,0)`;
    if (playerRef.current) playerRef.current.style.transform = `translate3d(${x}px,0,0)`;
    if (farRef.current) farRef.current.style.transform = `translate3d(${-(cam * 0.2 + x * 0.04)}px,0,0)`;
    if (midRef.current) midRef.current.style.transform = `translate3d(${-(cam * 0.5 + x * 0.1)}px,0,0)`;
  };

  const enterDoor = useCallback((i: number) => {
    if (enteringRef.current !== null) return;
    setEntering(i);
    setWalking(false);
    sfx.unlock();
    window.setTimeout(() => goToSection(DOORS[i].id), reduced ? 0 : 520);
    window.setTimeout(() => setEntering(null), reduced ? 50 : 1400);
  }, [reduced]);

  const step = useCallback(
    (t: number) => {
      const st = s.current;
      const dt = Math.min(50, t - (st.last || t)) / 1000;
      st.last = t;
      let dir = 0;
      if (st.target !== null) {
        const dx = st.target - st.x;
        if (Math.abs(dx) <= SPEED * dt + 1) {
          st.x = st.target;
          st.target = null;
          if (st.enterOnArrive >= 0) {
            const i = st.enterOnArrive;
            st.enterOnArrive = -1;
            enterDoor(i);
          }
        } else dir = Math.sign(dx);
      } else if (enteringRef.current === null) {
        dir = (st.right ? 1 : 0) - (st.left ? 1 : 0);
      }

      if (dir) {
        st.x = Math.max(14, Math.min(st.w - 14, st.x + dir * SPEED * dt));
        setFacing(dir > 0 ? 'right' : 'left');
      }
      setWalking(dir !== 0);
      place();

      // nearest door
      let n: number | null = null;
      DOORS.forEach((_, i) => {
        if (Math.abs(slot(i, st.w) - st.x) < NEAR) n = i;
      });
      setNear(n);

      // coins sit between doors; walk through them to collect
      coinsRef.current.forEach((got, i) => {
        if (got) return;
        const cx = (slot(i, st.w) + slot(i + 1, st.w)) / 2;
        if (Math.abs(cx - st.x) < 16) {
          setCoins((c) => c.map((v, k) => (k === i ? true : v)));
          sfx.coin();
          award(`map-coin:${i}`, 100, 'COIN');
          const r = coinRefs.current[i]?.getBoundingClientRect();
          if (r) pixelBurst(r.left + r.width / 2, r.top + r.height / 2, 10);
        }
      });

      if (dir !== 0 || st.target !== null) st.raf = requestAnimationFrame(step);
      else {
        st.raf = 0;
        st.last = 0;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enterDoor],
  );

  const kick = useCallback(() => {
    if (!s.current.raf) s.current.raf = requestAnimationFrame(step);
  }, [step]);

  // Measure the world; keep the player at the same relative spot on resize.
  useEffect(() => {
    const el = worldRef.current!;
    const measure = () => {
      const st = s.current;
      const vw = el.clientWidth;
      const w = Math.max(vw, MIN_WORLD);
      st.x = st.w ? (st.x / st.w) * w : slot(-0.5, w);
      st.w = w;
      st.vw = vw;
      if (innerRef.current) innerRef.current.style.width = `${w}px`;
      place();
      setNear(null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(s.current.raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const walkTo = (i: number, enter: boolean) => {
    const st = s.current;
    st.target = slot(i, st.w);
    st.enterOnArrive = enter ? i : -1;
    kick();
  };

  const jump = () => {
    if (reduced || !jumpRef.current || jumpRef.current.getAnimations().length) return;
    sfx.jump();
    jumpRef.current.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-38px)', offset: 0.45 }, { transform: 'translateY(0)' }],
      { duration: 420, easing: 'cubic-bezier(.3,.7,.4,1)' },
    );
  };

  const tryEnter = () => {
    if (near !== null) enterDoor(near);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const st = s.current;
    // Enter/Space on a focused door or pad button are that button's own click.
    if (e.target !== e.currentTarget && (k === 'enter' || k === ' ')) return;
    if (k === 'arrowleft' || k === 'a') {
      st.left = true;
      st.target = null;
    } else if (k === 'arrowright' || k === 'd') {
      st.right = true;
      st.target = null;
    } else if (k === 'arrowup' || k === 'w' || k === 'enter') tryEnter();
    else if (k === ' ') jump();
    else return;
    e.preventDefault();
    kick();
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') s.current.left = false;
    if (k === 'arrowright' || k === 'd') s.current.right = false;
  };

  const hold = (side: 'left' | 'right') => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      s.current[side] = true;
      s.current.target = null;
      kick();
    },
    onPointerUp: () => (s.current[side] = false),
    onPointerCancel: () => (s.current[side] = false),
    onLostPointerCapture: () => (s.current[side] = false),
  });

  const openCount = DOORS.filter((d) => open.includes(d.id)).length;

  return (
    <Stage id="play" label="World map" className="map-stage" threshold={0.3}>
      <div className="stage-wrap">
        <StageHeader
          n={1}
          kicker="WORLD MAP"
          title="CHOOSE A DOOR"
          subtitle="Each door opens a part of my story. Walk up to one and press ▲ to go in — or just click a door."
        />

        <div className="map-shell e" style={ev({ '--enter': 'crt-on', '--d': '520ms', '--dur': '420ms' })}>
          <div className="map-status">
            <span>
              STAGES OPEN <b className="text-green">{openCount}</b>/{DOORS.length}
            </span>
            <span className="hidden sm:inline">COINS {coins.filter(Boolean).length}/{coins.length}</span>
            {openCount < DOORS.length && (
              <button
                type="button"
                className="map-skip"
                onClick={(e) => {
                  unlock(...GATED);
                  sfx.unlock();
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  pixelBurst(r.left + r.width / 2, r.top + r.height / 2, 14);
                }}
              >
                OPEN ALL
              </button>
            )}
          </div>

          <div
            ref={worldRef}
            className={`map-world ${focused ? 'is-focused' : ''}`}
            tabIndex={0}
            role="application"
            aria-roledescription="mini game"
            aria-label="World map. Use left and right arrows to walk, up arrow or Enter at a door to open that stage, space to jump. Doors can also be selected with Tab."
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              s.current.left = s.current.right = false;
            }}
          >
            <div className="map-bg" aria-hidden="true">
              <div ref={farRef} className="map-far">
                <Skyline seed={23} fill="#1a0c47" windows="#2de2ff" width={480} height={90} minH={26} maxH={80} className="h-full w-full" />
              </div>
              <div ref={midRef} className="map-mid">
                <Skyline seed={8} fill="#28125f" windows="#ff3d9a" width={480} height={90} minH={10} maxH={40} className="h-full w-full" />
              </div>
            </div>

            <div ref={innerRef} className="map-inner">
            {DOORS.map((d, i) => {
              const isOpen = open.includes(d.id);
              const isNear = near === i;
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`door ${isOpen ? 'is-open' : ''} ${isNear ? 'is-near' : ''} ${entering === i ? 'is-entering' : ''}`}
                  style={ev({ left: `${((i + 1) / (DOORS.length + 1)) * 100}%`, '--door': d.color, '--d': `${700 + i * 90}ms` })}
                  onClick={(e) => {
                    e.stopPropagation();
                    walkTo(i, true);
                  }}
                  onFocus={() => walkTo(i, false)}
                  aria-label={`${d.label} door, stage ${i + 2}${isOpen ? ', open' : ', locked'}. Press Enter to go in.`}
                >
                  <span className="door-sign">
                    <span className="door-num">{i + 2}</span>
                    <span className="door-label">{d.label}</span>
                  </span>
                  <span className="door-frame e" style={ev({ '--enter': 'door-rise', '--d': `${700 + i * 90}ms`, '--dur': '360ms' })}>
                    <span className="door-glow" />
                    <span className="door-leaf" />
                    {!isOpen && <Lock className="door-lock" aria-hidden="true" />}
                  </span>
                  {isNear && entering === null && <span className="door-prompt">▲ {d.label}</span>}
                </button>
              );
            })}

            {coins.map((got, i) => (
              <span
                key={i}
                ref={(el) => (coinRefs.current[i] = el)}
                className={`map-coin ${got ? 'is-got' : ''}`}
                style={{ left: `${((i + 1.5) / (DOORS.length + 1)) * 100}%` }}
                aria-hidden="true"
              >
                <Icon name="coin" className="h-full w-full" />
              </span>
            ))}

            <div className="map-ground" aria-hidden="true" />

            <div ref={playerRef} className="map-player" aria-hidden="true">
              <div className={`map-player-inner e ${entering !== null ? 'is-entering' : ''}`} style={ev({ '--enter': 'drop-in', '--d': '1300ms', '--dur': '480ms' })}>
                <div ref={jumpRef} className="h-full w-full">
                  <Sprite pose={pose} facing={facing} className="h-full w-full" />
                </div>
              </div>
            </div>
            </div>

            {!focused && (
              <p className="map-focus-hint" aria-hidden="true">
                <span className="hint-fine">CLICK HERE, THEN USE ← → ▲</span>
                <span className="hint-touch">TAP A DOOR OR USE THE PAD</span>
              </p>
            )}
          </div>

          <div className="pad" aria-label="On-screen controls">
            <div className="pad-dpad">
              <button type="button" className="pad-btn" aria-label="Walk left" {...hold('left')}>
                ◀
              </button>
              <button type="button" className="pad-btn" aria-label="Walk right" {...hold('right')}>
                ▶
              </button>
            </div>
            <p className="pad-help">
              <kbd>←</kbd> <kbd>→</kbd> WALK · <kbd>▲</kbd> ENTER · <kbd>SPACE</kbd> JUMP
            </p>
            <div className="pad-actions">
              <button type="button" className="pad-btn is-round is-a" onClick={jump} aria-label="Jump">
                A
              </button>
              <button type="button" className="pad-btn is-round is-b" onClick={tryEnter} aria-label="Enter the nearest door" disabled={near === null}>
                ▲
              </button>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
