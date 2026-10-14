import { createStore, prefersReducedMotion, useStore } from './store';
import { unlock } from './unlock';

export type WipePhase = 'idle' | 'cover' | 'uncover';
export const wipe = createStore<{ phase: WipePhase; id: number }>({ phase: 'idle', id: 0 });
export const useWipe = () => useStore(wipe);

/** Timings shared with the CSS in .wipe (block = 130ms, diagonal spread = 220ms). */
export const WIPE_IN = 350;
const HOLD = 70;
const WIPE_OUT = 360;
let busy = false;

/**
 * Pixel blocks sweep in, `mid` runs while the screen is covered (the jump),
 * then the blocks sweep out in the same direction.
 */
export function runWipe(mid: () => void) {
  if (busy || prefersReducedMotion()) {
    mid();
    return;
  }
  busy = true;
  wipe.set({ phase: 'cover', id: Date.now() });
  window.setTimeout(() => {
    mid();
    wipe.set((w) => ({ ...w, phase: 'uncover' }));
    window.setTimeout(() => {
      wipe.set((w) => ({ ...w, phase: 'idle' }));
      busy = false;
    }, WIPE_OUT);
  }, WIPE_IN + HOLD);
}

export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
  if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** Stage jump. Picking a stage from the menu counts as opening its door. */
export function goToSection(id: string) {
  if (!document.getElementById(id)) return;
  runWipe(() => {
    unlock(id);
    // let the unlocked section mount before measuring its position
    requestAnimationFrame(() => jumpTo(id));
  });
}
