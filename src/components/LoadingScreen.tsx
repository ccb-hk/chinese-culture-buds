import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

type Props = {
  minMs?: number;
};

/** Brief splash while fonts / first paint settle. */
export function LoadingScreen({ minMs = 900 }: Props) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      const wait = Math.max(0, minMs - (performance.now() - start));
      window.setTimeout(() => {
        setFading(true);
        window.setTimeout(() => setVisible(false), 450);
      }, wait);
    };

    if (document.fonts?.ready) {
      void document.fonts.ready.then(finish).catch(finish);
    } else {
      finish();
    }

    // Warm TTS voice list (iOS / Chrome)
    try {
      window.speechSynthesis?.getVoices();
    } catch {
      /* ignore */
    }

    return () => {
      cancelled = true;
    };
  }, [minMs]);

  if (!visible) return null;

  return (
    <div className={[styles.overlay, fading ? styles.fadeOut : ''].join(' ')} aria-busy="true">
      <div className={styles.brand}>童心樂中華</div>
      <div className={styles.mascots} aria-hidden>
        <span>🐰</span>
        <span>🐉</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} />
      </div>
      <p className={styles.hint}>載入緊…</p>
    </div>
  );
}
