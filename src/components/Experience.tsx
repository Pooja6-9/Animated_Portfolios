import { experiences, type Experience as Exp } from '../data/resume';
import { useInView } from '../hooks/useInView';
import { Stage, StageHeader, ev } from './Stage';

/**
 * Stage 4: quest log. The route line draws as you scroll; each quest card
 * slides in on its own (stepped, like sprite motion) and gets a CLEARED stamp.
 */
export function Experience() {
  return (
    <Stage id="experience" n={4} label="Experience" className="quest-stage">
      <div className="stage-wrap">
        <StageHeader n={4} kicker="QUEST LOG" title="COMPLETED QUESTS" subtitle="Internships and research roles, most recent first." />
        <div className="quests">
          <span className="quest-route" aria-hidden="true" />
          <ol>
            {experiences.map((x, i) => (
              <Quest key={x.role} x={x} i={i} />
            ))}
          </ol>
        </div>
      </div>
    </Stage>
  );
}

function Quest({ x, i }: { x: Exp; i: number }) {
  const [ref, inView] = useInView<HTMLLIElement>(0.3);
  return (
    <li ref={ref} className={`quest ${i % 2 ? 'is-r' : 'is-l'} ${inView ? 'is-in' : ''}`}>
      <span className="quest-pin" aria-hidden="true">
        !
      </span>
      <article className="quest-card">
        <span className="quest-stamp" aria-hidden="true">
          CLEARED
        </span>
        <p className="quest-meta">
          <span className="text-yellow">QUEST {String(experiences.length - i).padStart(2, '0')}</span>
          <span>{x.period}</span>
        </p>
        <h3 className="quest-role">{x.role}</h3>
        <p className="quest-org">
          {x.organization}
          {x.location && <span className="text-muted"> · {x.location}</span>}
        </p>
        <ul className="quest-points">
          {x.points.map((p, k) => (
            <li key={k} style={ev({ '--k': k })}>
              {p}
            </li>
          ))}
        </ul>
        <p className="quest-loot">
          <span className="text-muted">LOOT</span>
          {x.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </p>
      </article>
    </li>
  );
}
