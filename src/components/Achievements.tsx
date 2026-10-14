import { useEffect, useRef, useState } from 'react';
import { achievements, certifications, leadership } from '../data/resume';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { burstFrom } from '../lib/particles';
import { award } from '../lib/score';
import { sfx } from '../lib/sfx';
import { Icon } from './pixel/PixelArt';
import { Stage, StageHeader, ev } from './Stage';

const UNLOCK_GAP = 620; // ms between achievement pops

/**
 * Stage 6: achievements pop one after another (shake → flash → burst → reveal),
 * then the inventory (certifications) and party (leadership) slide in.
 */
export function Achievements() {
  return (
    <Stage id="achievements" n={6} label="Achievements" className="trophy-stage">
      <div className="stage-wrap">
        <StageHeader n={6} kicker="TROPHY ROOM" title="ACHIEVEMENTS" subtitle="Hackathons, open source, certifications and the teams I help lead." />
        <Unlocks />
        <div className="trophy-lower">
          <section aria-labelledby="inv-h" className="inventory">
            <h3 id="inv-h" className="panel-title">
              <span className="text-cyan">◆</span> INVENTORY · CERTIFICATIONS
            </h3>
            <ul>
              {certifications.map((c, i) => (
                <li key={c.title} className="item e" style={ev({ '--enter': 'item-flip', '--d': `${2300 + i * 110}ms`, '--dur': '420ms' })}>
                  <span className="item-icon" aria-hidden="true">
                    <Icon name={i === 0 ? 'shield' : 'scroll'} className="h-7 w-7" />
                  </span>
                  <span>
                    <span className="item-name">{c.title}</span>
                    <span className="item-meta">
                      {c.issuer}
                      {c.date && ` · ${c.date}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="party-h" className="party">
            <h3 id="party-h" className="panel-title">
              <span className="text-pink">◆</span> PARTY · LEADERSHIP
            </h3>
            <ul>
              {leadership.map((l, i) => (
                <li key={l.role} className="member e" style={ev({ '--enter': 'step-in-r', '--d': `${2500 + i * 140}ms`, '--dur': '380ms' })}>
                  <span className="member-rank" aria-hidden="true">
                    <Icon name={i ? 'star' : 'crown'} className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="item-name">{l.role}</span>
                    <span className="item-meta">
                      {l.organization} · {l.period}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Stage>
  );
}

function Unlocks() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLUListElement>(0.4);
  const [count, setCount] = useState(reduced ? achievements.length : 0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      achievements.forEach((a) => award(`trophy:${a.title}`, 1000, 'ACHIEVEMENT'));
      return;
    }
    const t = achievements.map((a, i) =>
      window.setTimeout(() => {
        setCount(i + 1);
        sfx.unlock();
        award(`trophy:${a.title}`, 1000, 'ACHIEVEMENT');
        // burst once the badge has finished its shake
        window.setTimeout(() => burstFrom(items.current[i]?.querySelector('.ach-badge') ?? null, 18), 260);
      }, 450 + i * UNLOCK_GAP),
    );
    return () => t.forEach(clearTimeout);
  }, [inView, reduced]);

  return (
    <ul ref={ref} className="achs">
      {achievements.map((a, i) => (
        <li key={a.title} ref={(el) => (items.current[i] = el)} className={`ach ${i < count ? 'is-unlocked' : ''}`}>
          <span className="ach-badge" aria-hidden="true">
            <Icon name={a.icon === 'crown' ? 'crown' : a.icon === 'star' ? 'star' : 'trophy'} className="ach-icon" />
            <span className="ach-q">?</span>
          </span>
          <span className="ach-text">
            <span className="ach-banner">ACHIEVEMENT UNLOCKED</span>
            <span className="ach-title">{a.title}</span>
            <span className="ach-detail">
              {a.detail} · {a.year}
            </span>
          </span>
          <span className="ach-points" aria-hidden="true">
            +1000
          </span>
        </li>
      ))}
    </ul>
  );
}
