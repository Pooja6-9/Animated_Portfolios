import { useRef, useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { projects, type Project } from '../data/resume';
import { award } from '../lib/score';
import { sfx } from '../lib/sfx';
import { Icon } from './pixel/PixelArt';
import { Stage, StageHeader, ev } from './Stage';

const SHORT: Record<Project['illustration'], string> = { finance: 'FINFLOW', health: 'DISCHARGE AI', meal: 'TAT MEALS' };
const TINT: Record<Project['illustration'], string> = { finance: '#3dff8a', health: '#ff3d9a', meal: '#2de2ff' };

/**
 * Stage 5: "select your game". Three mini cabinets drop in and power on in turn;
 * choosing one lifts it, lights its marquee and channel-flips the big screen.
 */
export function Projects() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = projects[active];

  const select = (i: number, focus = false) => {
    const n = (i + projects.length) % projects.length;
    if (n !== active) sfx.select();
    setActive(n);
    award(`game:${n}`, 250, 'GAME LOADED');
    if (focus) tabs.current[n]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: -1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key], true);
  };

  return (
    <Stage id="projects" n={5} label="Projects" className="games-stage">
      <div className="stage-wrap">
        <StageHeader n={5} kicker="GAME SELECT" title="SELECT YOUR GAME" subtitle="Three things I’ve built. Use ← → or tap a cabinet." />

        <div className="minicabs" role="tablist" aria-label="Projects" onKeyDown={onKey}>
          {projects.map((x, i) => (
            <button
              key={x.name}
              ref={(el) => (tabs.current[i] = el)}
              id={`game-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls="game-screen"
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              className={`minicab e ${i === active ? 'is-active' : ''}`}
              style={ev({ '--enter': 'cab-drop', '--d': `${380 + i * 140}ms`, '--dur': '520ms', '--tint': TINT[x.illustration] })}
            >
              <span className="minicab-pointer" aria-hidden="true">
                P1 ▼
              </span>
              <span className="minicab-marquee">{SHORT[x.illustration]}</span>
              <span className="minicab-screen" style={ev({ '--d': `${700 + i * 140}ms` })}>
                <Attract kind={x.illustration} />
              </span>
              <span className="minicab-panel" aria-hidden="true">
                <i />
                <i />
              </span>
              <span className="sr-only">{x.name}</span>
            </button>
          ))}
        </div>

        <div
          id="game-screen"
          role="tabpanel"
          aria-labelledby={`game-tab-${active}`}
          className="game-screen e"
          style={ev({ '--enter': 'crt-on', '--d': '900ms', '--dur': '420ms', '--tint': TINT[p.illustration] })}
        >
          <div key={active} className="game-screen-inner">
            <div className="game-head">
              <p className="game-kicker">
                <span>{p.context}</span>
                <span>{p.period}</span>
                {p.status && !p.period.includes(p.status) && <span className="game-status">● {p.status.toUpperCase()}</span>}
              </p>
              <h3 className="game-title">{p.name}</h3>
              <p className="game-desc">{p.description}</p>
            </div>

            <div className="game-grid">
              <div>
                <p className="game-label">MOVES</p>
                <ul className="game-moves">
                  {p.contributions.map((c, k) => (
                    <li key={k} style={ev({ '--k': k })}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="game-label">HIGH SCORES</p>
                <dl className="game-scores">
                  {p.outcomes.map((o, k) => (
                    <div key={o.label} style={ev({ '--k': k })}>
                      <dt>{o.label}</dt>
                      <dd>{o.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="game-label mt-5">BUILT WITH</p>
                <p className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </p>
                {(p.githubUrl || p.liveUrl) && (
                  <p className="mt-5 flex flex-wrap gap-3">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="px-btn is-ghost">
                        <Github className="h-4 w-4" aria-hidden="true" /> CODE
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="px-btn is-pink">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" /> PLAY
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/** Attract-mode loop on each cabinet screen; only the selected cabinet animates. */
function Attract({ kind }: { kind: Project['illustration'] }) {
  if (kind === 'finance')
    return (
      <span className="attract attract-bars" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} style={ev({ '--i': i })} />
        ))}
        <Icon name="coin" className="attract-coin" />
      </span>
    );
  if (kind === 'health')
    return (
      <span className="attract attract-heart" aria-hidden="true">
        <Icon name="heart" className="attract-heart-icon" />
        <svg viewBox="0 0 60 16" className="attract-ecg" shapeRendering="crispEdges">
          <polyline points="0,10 16,10 20,4 24,14 28,2 32,10 60,10" fill="none" stroke="#3dff8a" strokeWidth="2" pathLength={1} />
        </svg>
      </span>
    );
  return (
    <span className="attract attract-bowl" aria-hidden="true">
      <span className="steam">
        <i />
        <i />
        <i />
      </span>
      <Icon name="bowl" className="attract-bowl-icon" />
    </span>
  );
}
