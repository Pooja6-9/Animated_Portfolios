import { prefersReducedMotion } from './store';

const COLORS = ['#ffd23f', '#ff3d9a', '#2de2ff', '#3dff8a', '#ffffff'];

/**
 * Square pixel particles flung from a point. DOM-based and short-lived
 * (one fixed layer, removed when the longest particle finishes).
 */
export function pixelBurst(x: number, y: number, count = 16, colors = COLORS) {
  if (prefersReducedMotion()) return;
  const layer = document.createElement('div');
  layer.className = 'px-burst';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const d = 36 + Math.random() * 46;
    const size = Math.random() > 0.6 ? 8 : 5;
    p.style.setProperty('--dx', `${Math.round(Math.cos(a) * d)}px`);
    p.style.setProperty('--dy', `${Math.round(Math.sin(a) * d)}px`);
    p.style.width = p.style.height = `${size}px`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 60}ms`;
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  window.setTimeout(() => layer.remove(), 800);
}

export function burstFrom(el: Element | null, count?: number) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  pixelBurst(r.left + r.width / 2, r.top + r.height / 2, count);
}
