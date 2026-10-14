import { createStore, safeStorage, useStore } from './store';

type Toast = { id: number; amount: number; label: string };
type Game = { score: number; hi: number; credits: number; toast: Toast | null };

const HI_KEY = 'pj-arcade-hi';
const savedHi = Number(safeStorage('local')?.getItem(HI_KEY) ?? 0) || 0;

export const game = createStore<Game>({ score: 0, hi: savedHi, credits: 0, toast: null });
const awarded = new Set<string>();

/** Adds points once per key (visiting a stage, collecting a coin, unlocking a trophy…). */
export function award(key: string, amount: number, label: string) {
  if (awarded.has(key)) return;
  awarded.add(key);
  game.set((g) => {
    const score = g.score + amount;
    const hi = Math.max(g.hi, score);
    if (hi !== g.hi) safeStorage('local')?.setItem(HI_KEY, String(hi));
    return { ...g, score, hi, toast: { id: Date.now() + Math.random(), amount, label } };
  });
}

export function addCredit() {
  game.set((g) => ({ ...g, credits: Math.min(g.credits + 1, 99) }));
}

export const useGame = () => useStore(game);

export const pad = (n: number, len = 6) => String(n).padStart(len, '0');
