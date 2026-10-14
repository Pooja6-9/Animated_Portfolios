import { useRef, useState } from 'react';
import { skillCategories, type SkillCategory } from '../data/resume';
import { sfx } from '../lib/sfx';
import { Icon } from './pixel/PixelArt';
import { Stage, StageHeader, ev } from './Stage';

const GLYPH: Record<SkillCategory['icon'], string> = {
  code: '{ }',
  web: '</>',
  server: 'API',
  database: 'DB',
  brain: 'AI',
  tools: 'GIT',
  heart: '',
};
const COLORS = ['#ff3d9a', '#2de2ff', '#ffd23f', '#3dff8a', '#b18cff', '#ff8a3d', '#ff6fb5'];
const TOTAL = skillCategories.reduce((n, c) => n + c.skills.length, 0);

/**
 * Stage 3: a skill tree. Entrance: the trunk draws down, each branch node
 * unlocks in turn, then the first branch grows its leaves. Arrow keys move
 * between branches (tabs), and switching re-grows the leaves.
 */
export function Skills() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const cat = skillCategories[active];

  const select = (i: number, focus = false) => {
    const n = (i + skillCategories.length) % skillCategories.length;
    if (n !== active) sfx.blip();
    setActive(n);
    if (focus) tabs.current[n]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: -1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key], true);
  };

  return (
    <Stage id="skills" n={3} label="Skills" className="skills-stage">
      <div className="stage-wrap">
        <StageHeader n={3} kicker="SKILL TREE" title="UNLOCKED ABILITIES" subtitle="Pick a branch to see what’s on it." />

        <p className="tree-counter e" style={ev({ '--d': '400ms' })}>
          ABILITIES UNLOCKED <b>{TOTAL}</b>
        </p>

        <div className="tree">
          <div className="tree-trunk" role="tablist" aria-orientation="vertical" aria-label="Skill branches" onKeyDown={onKey}>
            <span className="trunk-line" aria-hidden="true" />
            <span className="trunk-root e" style={ev({ '--enter': 'pop-in', '--d': '300ms' })} aria-hidden="true">
              P1
            </span>
            {skillCategories.map((c, i) => (
              <button
                key={c.title}
                ref={(el) => (tabs.current[i] = el)}
                id={`skill-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls="skill-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => select(i)}
                className={`node e ${i === active ? 'is-active' : ''}`}
                style={ev({ '--enter': 'node-unlock', '--d': `${520 + i * 110}ms`, '--dur': '420ms', '--node': COLORS[i] })}
              >
                <span className="node-gem" aria-hidden="true">
                  {c.icon === 'heart' ? <Icon name="heart" className="h-4 w-4" /> : GLYPH[c.icon]}
                </span>
                <span className="node-name">{c.title}</span>
                <span className="node-lv" aria-hidden="true">
                  ×{c.skills.length}
                </span>
              </button>
            ))}
          </div>

          <div
            id="skill-panel"
            role="tabpanel"
            aria-labelledby={`skill-tab-${active}`}
            className="branch e"
            style={ev({ '--enter': 'crt-on', '--d': `${520 + skillCategories.length * 110}ms`, '--dur': '380ms', '--node': COLORS[active] })}
          >
            <div key={active} className="branch-inner">
              <p className="branch-kicker">BRANCH {String(active + 1).padStart(2, '0')}</p>
              <h3 className="branch-title">{cat.title}</h3>
              {cat.note && <p className="branch-note">{cat.note}</p>}
              <ul className="leaves">
                {cat.skills.map((s, i) => (
                  <li key={s} style={ev({ '--i': i })}>
                    <span className="leaf">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
