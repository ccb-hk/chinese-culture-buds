import { motion, type TargetAndTransition } from 'framer-motion';
import { assetPath } from '../engine/assets';
import { playSfx } from '../engine/audio';
import styles from './Guide.module.css';

export type GuideId = 'puff' | 'dongdong';
export type GuidePose = 'idle' | 'talk' | 'cheer' | 'tilt';

type Props = {
  id: GuideId;
  pose?: GuidePose;
  size?: number;
  showName?: boolean;
  onClick?: () => void;
};

const NAMES: Record<GuideId, string> = {
  puff: '胖胖',
  dongdong: '咚咚',
};

const poseAnim: Record<GuidePose, TargetAndTransition> = {
  idle: {
    y: [0, -6, 0],
    rotate: [0, -2, 2, 0],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
  talk: {
    rotate: [0, -4, 4, -2, 2, 0],
    transition: { duration: 0.8, repeat: Infinity },
  },
  cheer: {
    scale: [1, 1.12, 1],
    rotate: [0, -8, 8, 0],
    transition: { duration: 0.7, repeat: Infinity },
  },
  tilt: {
    rotate: [0, -12, -8, -12],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export function Guide({
  id,
  pose = 'idle',
  size = 140,
  showName = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={styles.wrap}
      style={{ width: size, height: size + (showName ? 28 : 0) }}
      aria-label={NAMES[id]}
      onClick={() => {
        playSfx('tap');
        onClick?.();
      }}
    >
      <motion.img
        className={styles.img}
        src={assetPath('characters', `${id}.svg`)}
        alt=""
        draggable={false}
        animate={poseAnim[pose]}
        style={{ width: size, height: size }}
      />
      {showName && <span className={styles.label}>{NAMES[id]}</span>}
    </button>
  );
}
