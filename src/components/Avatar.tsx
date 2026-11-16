import { motion } from 'framer-motion';
import { getAvatarAnchor } from '../content/avatar';
import { assets, avatarBodySrc, avatarHeadSrc } from '../content/assets';
import type { Gender, HeadId, OutfitId } from '../content/types';
import styles from './Avatar.module.css';

type Props = {
  head: HeadId;
  gender: Gender;
  outfit?: OutfitId;
  size?: number;
  className?: string;
  spinning?: boolean;
};

/**
 * Body is laid out at its natural aspect ratio (width = size).
 * Head is positioned as % of that displayed body box:
 * - left = headCenterX of body width, with translateX(-50%)
 * - width = 70% of body width
 * - bottom of head sits on body top, then shifted down 10% of head height (collar overlap)
 */
export function Avatar({
  head,
  gender,
  outfit = 'daily',
  size = 160,
  className = '',
  spinning = false,
}: Props) {
  const bodySrc = avatarBodySrc(outfit, gender);
  const headSrc = avatarHeadSrc(head);
  const anchor = getAvatarAnchor(outfit, gender);
  const showBow = gender === 'girl';

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={{
        width: size,
        animation: spinning ? 'tsl-spin 1.2s ease-in-out' : undefined,
      }}
      aria-hidden
    >
      <div className={styles.figure}>
        <img
          className={styles.body}
          src={bodySrc}
          alt=""
          width={size}
          height={Math.round(size * 1.35)}
          decoding="async"
          draggable={false}
        />
        <div
          className={styles.headAnchor}
          style={{ left: `${anchor.headCenterX * 100}%` }}
        >
          <motion.div
            className={styles.headMotion}
            style={{ y: '10%' }}
            animate={{ rotate: [-2.5, 2.5, -2.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              className={styles.head}
              src={headSrc}
              alt=""
              width={Math.round(size * 0.7)}
              height={Math.round(size * 0.7)}
              decoding="async"
              draggable={false}
            />
            {showBow && (
              <img
                className={styles.bow}
                src={assets.avatar.bow}
                alt=""
                width={Math.round(size * 0.28)}
                height={Math.round(size * 0.22)}
                decoding="async"
                draggable={false}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
