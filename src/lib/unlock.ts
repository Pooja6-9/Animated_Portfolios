import { createStore, prefersReducedMotion, safeStorage, useStore } from './store';

export const GATED = ['about', 'skills', 'experience', 'projects', 'achievements', 'contact'] as const;
const KEY = 'pj-arcade-unlocked';

function initial(): string[] {
  // Reduced motion and deep links skip the gameplay gate entirely.
  if (typeof window === 'undefined' || prefersReducedMotion()) return [...GATED];
  const hash = location.hash.slice(1);
  const saved: string[] = JSON.parse(safeStorage('session')?.getItem(KEY) ?? '[]');
  return hash && (GATED as readonly string[]).includes(hash) ? [...GATED] : saved;
}

export const unlocked = createStore<string[]>(initial());
export const useUnlocked = () => useStore(unlocked);

export function unlock(...ids: string[]) {
  unlocked.set((u) => {
    const next = Array.from(new Set([...u, ...ids]));
    safeStorage('session')?.setItem(KEY, JSON.stringify(next));
    return next;
  });
}

export const isUnlocked = (id: string) => !(GATED as readonly string[]).includes(id) || unlocked.get().includes(id);
