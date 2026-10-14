import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { education, hobbies, profile } from '../data/resume';
import { useInView, useMediaQuery } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { pixelBurst } from '../lib/particles';
import { award } from '../lib/score';
import { sfx } from '../lib/sfx';
import { Skyline } from './fx/Skyline';
import { Icon, type IconName } from './pixel/PixelArt';
import { Sprite, type Pose } from './pixel/Sprite';
import { Stage, StageHeader } from './Stage';

type Panel = { kicker: string; title: string; body: ReactNode };

const HOBBY_ICONS: IconName[] = ['scroll', 'star', 'crown', 'heart'];

const PANELS: Panel[] = [
  {
    kicker: 'CHECKPOINT 1',
    title: 'PLAYER PROFILE',
    body: <p>{profile.summary[0]}</p>,
  },
  {
    kicker: 'CHECKPOINT 2',
    title: 'HOW I PLAY',
    body: (
      <>
        <p>{profile.summary[1]}</p>
        <p className="mt-3 text-muted">{profile.summary[2]}</p>
      </>
    ),
  },
  {
    kicker: 'SAVE POINT',
    title: 'EDUCATION',
    body: (
      <dl className="lvl-stats">
        <div>
          <dt>SCHOOL</dt>
          <dd>{education.institution}</dd>
        </div>
        <div>
          <dt>CLASS</dt>
          <dd>{education.degree}</dd>
        </div>
        <div>
          <dt>YEARS</dt>
          <dd>{education.period}</dd>
        </div>
      </dl>
    ),
  },
  {
    kicker: 'POWER-UPS',
    title: 'HOBBIES',
    body: (
      <ul className="lvl-powerups">
        {hobbies.map((h, i) => (
          <li key={h}>
            <Icon name={HOBBY_ICONS[i % HOBBY_ICONS.length]} className="h-6 w-6" />
            {h}
          </li>
        ))}
      </ul>
    ),
  },
  {
    kicker: 'NEXT LEVEL',
    title: 'WHERE I’M HEADED',
    body: <p>{profile.careerDirection}</p>,
  },
];

/**
 * Stage 2: a side-scrolling level. Vertical scroll drives the camera to the
 * right; the player walks (frames tied to distance), hits a ? block at every
 * checkpoint, and raises the flag at the end. Parallax: far 0.12, mid 0.4, track 1, front 1.25.
 */
export function About() {
  const reduced = useReducedMotion();
  const short = useMediaQuery('(max-height: 520px)');
  return (
    <Stage id="about" n={2} label="About" className="about-stage" threshold={0.05}>
      {reduced || short ? <AboutStatic /> : <AboutLevel />}
    </Stage>
  );
}

function AboutStatic() {
  return (
    <div className="stage-wrap">
      <StageHeader n={2} kicker="WORLD 1-1" title="ABOUT ME" />
      <div className="grid gap-5 md:grid-cols-2">
        {PANELS.map((p) => (
          <article key={p.title} className="lvl-sign is-static">
            <p className="lvl-kicker">{p.kicker}</p>
            <h3 className="lvl-title">{p.title}</h3>
            <div className="lvl-body">{p.body}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AboutLevel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [height, setHeight] = useState<number | null>(null);
  const [pose, setPose] = useState<Pose>('stand');
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [hit, setHit] = useState<boolean[]>(() => PANELS.map(() => false));
  const [cleared, setCleared] = useState(false);
  const [viewRef, inView] = useInView<HTMLDivElement>(0.35);
  const goalRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const m = useRef({ max: 0, walk: 0, lastX: 0, dist: 0, idle: 0, hit: PANELS.map(() => false), charX: 0, blocks: [] as number[] });

  // Measure: the section is exactly tall enough that 1px of scroll = 1px of travel.
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current!;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const max = Math.max(0, track.scrollWidth - vw);
      const charX = Math.min(vw * 0.18, 220);
      // After the camera stops, the last stretch of scroll walks the player up to the flag pole.
      const pole = goalRef.current ? goalRef.current.offsetLeft + 40 - max : charX;
      m.current.max = max;
      m.current.charX = charX;
      m.current.walk = Math.max(0, pole - 44 - charX);
      m.current.blocks = blockRefs.current.map((b) => (b ? b.offsetLeft + (b.offsetParent as HTMLElement).offsetLeft + b.offsetWidth / 2 : 0));
      setHeight(max + m.current.walk + vh);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current!);
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = sectionRef.current;
      if (!sec) return;
      const st = m.current;
      const top = sec.getBoundingClientRect().top;
      const raw = Math.max(0, Math.min(st.max + st.walk, -top));
      const x = Math.min(raw, st.max);
      const px = raw - x;
      playerRef.current!.style.transform = `translate3d(${px}px,0,0)`;
      trackRef.current!.style.transform = `translate3d(${-x}px,0,0)`;
      farRef.current!.style.transform = `translate3d(${-x * 0.12}px,0,0)`;
      midRef.current!.style.transform = `translate3d(${-x * 0.4}px,0,0)`;
      frontRef.current!.style.transform = `translate3d(${-x * 1.25}px,0,0)`;

      const dx = raw - st.lastX;
      st.lastX = raw;
      if (Math.abs(dx) > 0.5) {
        st.dist += Math.abs(dx);
        setFacing(dx > 0 ? 'right' : 'left');
        if (!jumpRef.current?.getAnimations().length) setPose(Math.floor(st.dist / 26) % 2 ? 'walk2' : 'walk1');
        clearTimeout(st.idle);
        st.idle = window.setTimeout(() => setPose('stand'), 160);
      }

      // ? blocks: bumped when the camera brings one over the player's head
      st.blocks.forEach((bx, i) => {
        if (st.hit[i] || !bx || bx - x > st.charX + 24) return;
        st.hit[i] = true;
        setHit([...st.hit]);
        bump(i);
      });
      if (raw >= st.max + st.walk - 4 && st.max > 0) setCleared(true);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    if (cleared) {
      award('about:clear', 500, 'COURSE CLEAR');
      sfx.start();
    }
  }, [cleared]);

  const bump = (i: number) => {
    sfx.coin();
    award(`about-coin:${i}`, 100, 'COIN');
    const el = jumpRef.current;
    if (el) {
      setPose('jump');
      el.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-46px)', offset: 0.42 }, { transform: 'translateY(0)' }],
        { duration: 440, easing: 'cubic-bezier(.3,.7,.4,1)' },
      ).onfinish = () => setPose('stand');
    }
    const r = blockRefs.current[i]?.getBoundingClientRect();
    if (r) window.setTimeout(() => pixelBurst(r.left + r.width / 2, r.top, 10), 160);
  };

  return (
    <div ref={sectionRef} className="lvl" style={{ height: height ?? '300vh' }}>
      <div ref={viewRef} className={`lvl-view ${inView ? 'is-live' : ''}`}>
        <div className="lvl-sky" aria-hidden="true">
          <div ref={farRef} className="lvl-far">
            <Skyline seed={31} fill="#1b0d4a" windows="#2de2ff" width={900} height={100} minH={30} maxH={92} className="h-full w-full" />
          </div>
          <div ref={midRef} className="lvl-mid">
            <Skyline seed={5} fill="#2b1468" windows="#ffd23f" width={900} height={100} minH={12} maxH={46} className="h-full w-full" />
          </div>
        </div>

        <p className="lvl-card" aria-hidden="true">
          <span>WORLD 1-1</span>
          <span className="lvl-card-sub">ABOUT POOJA</span>
        </p>

        <div ref={trackRef} className="lvl-track">
          <div className="lvl-intro">
            <StageHeader n={2} kicker="WORLD 1-1" title="ABOUT ME" align="left" subtitle="Keep scrolling — the level runs right." />
            <p className="lvl-run-hint" aria-hidden="true">
              SCROLL ▼ TO RUN ▶
            </p>
          </div>

          {PANELS.map((p, i) => (
            <div key={p.title} className="lvl-slot">
              <span
                ref={(el) => (blockRefs.current[i] = el)}
                className={`qblock ${hit[i] ? 'is-hit' : ''}`}
                aria-hidden="true"
              >
                <span className="qblock-face">{hit[i] ? '' : '?'}</span>
                {hit[i] && (
                  <span className="qblock-coin">
                    <Icon name="coin" className="h-full w-full" />
                  </span>
                )}
              </span>
              <article className={`lvl-sign ${hit[i] ? 'is-reached' : ''}`}>
                <p className="lvl-kicker">{p.kicker}</p>
                <h3 className="lvl-title">{p.title}</h3>
                <div className="lvl-body">{p.body}</div>
              </article>
            </div>
          ))}

          <div ref={goalRef} className="lvl-goal" aria-hidden="true">
            <span className="goal-pole" />
            <span className={`goal-flag ${cleared ? 'is-up' : ''}`} />
            <span className={`goal-text ${cleared ? 'is-on' : ''}`}>COURSE CLEAR!</span>
          </div>
          <div className="lvl-ground" aria-hidden="true" />
        </div>

        <div ref={frontRef} className="lvl-front" aria-hidden="true" />

        <div ref={playerRef} className="lvl-player" aria-hidden="true">
          <div className="lvl-player-drop">
            <div ref={jumpRef} className="h-full w-full">
              <Sprite pose={pose} facing={facing} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
