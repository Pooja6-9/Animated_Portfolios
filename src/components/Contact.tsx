import { ArrowUpRight, Download, Github, Linkedin, Mail, type LucideIcon } from 'lucide-react';
import { profile } from '../data/resume';
import { pad, useGame } from '../lib/score';
import { sfx } from '../lib/sfx';
import { Stage, StageHeader, ev } from './Stage';

type Row = { rank: string; label: string; value: string; href: string; icon: LucideIcon; external: boolean };

const ROWS: Row[] = [
  { rank: '1ST', label: 'EMAIL', value: profile.email, href: `mailto:${profile.email}`, icon: Mail, external: false },
  { rank: '2ND', label: 'LINKEDIN', value: profile.linkedinLabel, href: profile.linkedin, icon: Linkedin, external: true },
  { rank: '3RD', label: 'GITHUB', value: profile.githubLabel, href: profile.github, icon: Github, external: true },
];
const RANK_COLORS = ['#ffd23f', '#2de2ff', '#ff3d9a'];

/** Stage 7: CONTINUE? A high-score table whose rows type in one by one. */
export function Contact() {
  const { score } = useGame();
  return (
    <Stage id="contact" n={7} label="Contact" className="continue-stage">
      <div className="stage-wrap">
        <StageHeader
          n={7}
          kicker="CONTINUE?"
          title="PLAYER 2, JOIN IN"
          subtitle="I’m open to software engineering internships and placement opportunities. Pick a channel."
        />

        <div className="hiscore e" style={ev({ '--enter': 'crt-on', '--d': '500ms', '--dur': '400ms' })}>
          <div className="hiscore-head" aria-hidden="true">
            <span>RANK</span>
            <span>CHANNEL</span>
            <span className="hidden sm:block">HANDLE</span>
          </div>
          <ul>
            {ROWS.map((r, i) => (
              <li key={r.label} className="e" style={ev({ '--enter': 'type-in', '--ease': 'steps(16)', '--d': `${850 + i * 260}ms`, '--dur': '420ms' })}>
                <a
                  href={r.href}
                  onClick={() => sfx.select()}
                  {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="hiscore-row"
                  style={ev({ '--rank': RANK_COLORS[i] })}
                >
                  <span className="hs-rank">{r.rank}</span>
                  <span className="hs-label">
                    <r.icon className="h-4 w-4" aria-hidden="true" />
                    {r.label}
                  </span>
                  <span className="hs-value">{r.value}</span>
                  <ArrowUpRight className="hs-arrow h-4 w-4" aria-hidden="true" />
                  {r.external && <span className="sr-only">(opens in a new tab)</span>}
                </a>
              </li>
            ))}
          </ul>
          <div className="hiscore-foot e" style={ev({ '--d': '1700ms' })}>
            <p>
              YOUR SCORE <b className="text-yellow">{pad(score)}</b>
            </p>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} download="Pooja_Jain_Resume.pdf" className="px-btn is-yellow" onClick={() => sfx.select()}>
                <Download className="h-4 w-4" aria-hidden="true" /> DOWNLOAD RESUME
              </a>
            )}
          </div>
        </div>
      </div>
    </Stage>
  );
}
