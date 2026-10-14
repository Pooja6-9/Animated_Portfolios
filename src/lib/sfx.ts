import { createStore, safeStorage, useStore } from './store';

const KEY = 'pj-arcade-sound';
export const sound = createStore<boolean>(safeStorage('local')?.getItem(KEY) === 'on');
export const useSound = () => useStore(sound);

export function toggleSound() {
  const next = !sound.get();
  sound.set(next);
  safeStorage('local')?.setItem(KEY, next ? 'on' : 'off');
  if (next) sfx.blip();
}

let ctx: AudioContext | null = null;

/** One square-wave note. Everything here is tiny and synthesized; no audio files. */
function tone(freq: number, dur: number, at = 0, type: OscillatorType = 'square', vol = 0.035, slideTo?: number) {
  if (!sound.get()) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    /* audio is decoration only */
  }
}

export const sfx = {
  blip: () => tone(880, 0.05),
  select: () => {
    tone(523, 0.05);
    tone(784, 0.07, 0.05);
  },
  coin: () => {
    tone(988, 0.08);
    tone(1319, 0.32, 0.08);
  },
  jump: () => tone(330, 0.16, 0, 'square', 0.03, 660),
  start: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.09, i * 0.08)),
  unlock: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.1, i * 0.06, 'triangle', 0.05)),
};
