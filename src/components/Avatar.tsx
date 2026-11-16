import { assetPath } from '../engine/assets';
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

export function Avatar({
  head,
  gender,
  outfit = 'daily',
  size = 160,
  className = '',
  spinning = false,
}: Props) {
  const bodySrc = assetPath('avatar/body', `${gender}.svg`);
  const outfitSrc = assetPath('avatar/outfit', `${outfit}_${gender}.svg`);
  const headSrc = assetPath('avatar/head', `${head}.svg`);

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size * 1.3,
        animation: spinning ? 'tsl-spin 1.2s ease-in-out' : undefined,
      }}
      aria-hidden
    >
      <img className={styles.body} src={bodySrc} alt="" draggable={false} />
      <img className={styles.layer} src={outfitSrc} alt="" draggable={false} />
      <img className={`${styles.layer} ${styles.head}`} src={headSrc} alt="" draggable={false} />
    </div>
  );
}
