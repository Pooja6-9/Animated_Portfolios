import { useEffect } from 'react';
import { Boot } from './components/Boot';
import { Hud, STAGES } from './components/Hud';
import { Hero } from './components/Hero';
import { WorldMap } from './components/WorldMap';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Experience } from './components/Experience';
import { Projects } from './components/Projects';
import { Achievements } from './components/Achievements';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { PixelDivider } from './components/Stage';
import { Starfield } from './components/fx/Starfield';
import { PixelWipe } from './components/fx/PixelWipe';
import { goToSection } from './lib/transition';

export default function App() {
  // Number keys 1–8 jump between stages (ignored while typing or inside the mini game).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('.boot, .stage-menu')) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= STAGES.length) goToSection(STAGES[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a href="#play" className="skip-link">
        Skip to content
      </a>
      <Starfield />
      <Hud />
      <main>
        <Hero />
        <WorldMap />
        <PixelDivider tone="cyan" />
        <About />
        <PixelDivider />
        <Skills />
        <PixelDivider tone="yellow" />
        <Experience />
        <PixelDivider tone="cyan" />
        <Projects />
        <PixelDivider />
        <Achievements />
        <PixelDivider tone="yellow" />
        <Contact />
      </main>
      <Footer />
      <div className="crt-overlay" aria-hidden="true" />
      <PixelWipe />
      <Boot />
    </>
  );
}
