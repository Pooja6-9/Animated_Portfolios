import { useEffect, useState } from 'react';
import { PixelArt } from './PixelArt';

export type Pose = 'stand' | 'blink' | 'walk1' | 'walk2' | 'jump';

// 12 x 16 player sprite, facing right. Head and torso are shared; legs swap per pose.
const HEAD = [
  '....hhhhh...',
  '...hhhhhhh..',
  '..hhhhhhhhh.',
  '.hhhhhhhhhh.',
  'hhhhsssses..',
  'hhhhssssss..',
  '.hhhssssss..',
  '.hh..ssss...',
];
const HEAD_BLINK = [...HEAD.slice(0, 4), 'hhhhssssss..', ...HEAD.slice(5)];
const TORSO = ['...pppppp...', '..pppppppp..', '..spppppps..', '...pppppp...'];
const TORSO_JUMP = ['.s.pppppp.s.', '.spppppppps.', '..pppppppp..', '...pppppp...'];
const LEGS: Record<Exclude<Pose, 'blink'>, string[]> = {
  stand: ['...bbbbbb...', '...bb..bb...', '...bb..bb...', '..www..www..'],
  walk1: ['...bbbbbb...', '..bb....bb..', '.bb......bb.', '.ww......ww.'],
  walk2: ['...bbbbbb...', '....bbbb....', '....bb.bb...', '...www.ww...'],
  jump: ['...bbbbbb...', '..bbb..bbb..', '..ww....ww..', '............'],
};

const PALETTE = { h: '#3b1748', s: '#f6c49e', e: '#14081c', p: '#ff3d9a', b: '#3a46d6', w: '#f5f2ff' };

const FRAMES: Record<Pose, string[]> = {
  stand: [...HEAD, ...TORSO, ...LEGS.stand],
  blink: [...HEAD_BLINK, ...TORSO, ...LEGS.stand],
  walk1: [...HEAD, ...TORSO, ...LEGS.walk1],
  walk2: [...HEAD, ...TORSO, ...LEGS.walk2],
  jump: [...HEAD, ...TORSO_JUMP, ...LEGS.jump],
};

export function Sprite({
  pose,
  facing = 'right',
  className = '',
}: {
  pose: Pose;
  facing?: 'left' | 'right';
  className?: string;
}) {
  return (
    <span className={`sprite ${facing === 'left' ? 'is-left' : ''} ${className}`} aria-hidden="true">
      <PixelArt map={FRAMES[pose]} palette={PALETTE} className="block h-full w-full" />
    </span>
  );
}

/** Walk cycle at ~7fps while `walking`, an occasional blink while idle. */
export function useSpritePose(walking: boolean, reduced: boolean): Pose {
  const [pose, setPose] = useState<Pose>('stand');
  useEffect(() => {
    if (reduced) {
      setPose('stand');
      return;
    }
    if (walking) {
      let f = 0;
      setPose('walk1');
      const t = window.setInterval(() => setPose(++f % 2 ? 'walk2' : 'walk1'), 140);
      return () => window.clearInterval(t);
    }
    setPose('stand');
    const t = window.setInterval(() => {
      setPose('blink');
      window.setTimeout(() => setPose('stand'), 140);
    }, 3200);
    return () => window.clearInterval(t);
  }, [walking, reduced]);
  return pose;
}
