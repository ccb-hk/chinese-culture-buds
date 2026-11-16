import { useEffect, useRef } from 'react';
import { BigButton } from '../components/BigButton';
import { Guide } from '../components/Guide';
import { Subtitle } from '../components/Subtitle';
import { playLine, unlockAudio } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import styles from './StartScreen.module.css';

export function StartScreen() {
  const { state } = useProgress();
  const profile = state.profile;
  const welcomedRef = useRef(false);

  useEffect(() => {
    if (!profile || welcomedRef.current) return;
    welcomedRef.current = true;
    playLine('start_welcome_back', { name: profile.name });
    const t = window.setTimeout(() => navigate({ name: 'map' }), 1600);
    return () => window.clearTimeout(t);
  }, [profile]);

  const start = async () => {
    await unlockAudio();
    if (profile) {
      navigate({ name: 'map' });
      return;
    }
    navigate({ name: 'avatar' });
  };

  return (
    <div className={styles.page}>
      <Subtitle />
      <h1 className={styles.brand}>童心樂中華</h1>

      <div className={styles.mascots}>
        <Guide id="puff" pose="idle" size={150} showName />
        <Guide id="dongdong" pose="cheer" size={150} showName />
      </div>

      {profile ? (
        <p className={styles.hint}>歡迎返嚟，{profile.name}！</p>
      ) : (
        <p className={styles.hint}>一齊嚟認識中華文化啦！</p>
      )}

      <BigButton onClick={() => void start()}>▶ 開始</BigButton>

      <button
        type="button"
        className={styles.parents}
        onClick={() => navigate({ name: 'parents' })}
      >
        家長／老師
      </button>
    </div>
  );
}
