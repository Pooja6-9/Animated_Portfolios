# Pooja Jain — Portfolio Arcade

A retro-arcade portfolio built with React, Vite, TypeScript and Tailwind CSS v4. The site plays like a small game: insert a coin, walk the World Map, and open each stage through its door.

```bash
npm install
npm run dev      # http://localhost:5181
npm run build
```

All content comes from `src/data/resume.ts`.

## How it plays

| Stage | Theme | Entrance / interaction |
| --- | --- | --- |
| Boot | CRT power-on → BIOS → title → **INSERT COIN** | Enter / tap the coin, `S` toggles sound, `Esc` skips. Once per session. |
| 0 Start | Arcade cabinet | Scenery rises, cabinet lands, bulbs light then chase, marquee ignites, screen powers on, text types, buttons pop, player walks in. Coin slot and player are clickable. |
| 1 World Map | Playable hub | `← →` / `A D` / on-screen pad to walk, `▲` / Enter at a door to open that stage, Space jumps. Clicking or tabbing to a door walks there. Coins between doors. |
| 2 About | Side-scrolling level | Vertical scroll drives the camera. The player walks, bumps ? blocks at checkpoints, then walks to the flag. |
| 3 Skills | Skill tree | Trunk draws, branches unlock in turn, leaves grow. Arrow keys switch branches. |
| 4 Quests | Quest log | Route draws, each card steps in on scroll and gets a CLEARED stamp. |
| 5 Games | Cabinet select | Cabinets drop in and power on. Selecting one channel-flips the big screen. `← →` to switch. |
| 6 Trophies | Achievements | Each badge shakes, flashes, bursts and reveals. Then certifications and leadership slide in. |
| 7 Continue | High-score table | Contact rows type in. Shows your score. |

Locked stages show a door with **OPEN DOOR** (no game needed), and picking a stage from the HUD or pressing `1–8` opens it too, so nothing is ever gated for a recruiter or keyboard user. Pixel-block wipes run between every stage jump.

## Motion rules

- Durations stay at 130–520ms. Longer moments come from staggering and short pauses, not slow tweens. Pixel things use `steps()`, physical things use ease-out or back easing.
- Only `transform`, `opacity`, `clip-path` and `filter` are animated. The starfield is a half-resolution canvas at ~30fps that pauses when the tab is hidden. Idle cabinet screens pause their loops.
- `prefers-reduced-motion`: no boot, all stages open, the About level becomes a static grid, and every element renders in its final state.

## Structure

- `src/components/` — one file per stage plus `Boot`, `Hud` and `Stage` (section shell, locked door, header, divider)
- `src/components/pixel/` — `PixelArt` (character-map SVG renderer + icon set) and `Sprite` (player frames)
- `src/components/fx/` — `Starfield`, `Skyline`, `PixelWipe`
- `src/lib/` — tiny stores for score, sound, unlocked stages and the wipe, plus pixel particles
- `src/index.css` — tokens, all keyframes, and the choreography block (`.e` + `--enter / --d / --dur / --ease`)
