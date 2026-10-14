import { profile } from '../data/resume';
import { replayBoot } from './Boot';

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-thanks">THANKS FOR PLAYING</p>
      <p className="footer-meta">
        © {new Date().getFullYear()} {profile.name} · Built with React &amp; Vite
      </p>
      <button type="button" className="px-btn is-ghost motion-only" onClick={replayBoot}>
        ↺ REPLAY INTRO
      </button>
    </footer>
  );
}
