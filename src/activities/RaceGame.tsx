import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Confetti } from '../components/Confetti';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assetPath } from '../engine/assets';
import { playLine, playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './RaceGame.module.css';

const BPM = 85;
const BEAT_MS = Math.round(60000 / BPM);
const BEAT_WINDOW_MS = 180;
const FINISH_AT = 100;
const AUTO_SPEED = 0.035; // progress per frame-ish via rAF dt
const HIT_SPEED = 2.4;
const MISS_SPEED = 0.9;

type Props = {
  onComplete: () => void;
};

export function RaceGame({ onComplete }: Props) {
  const { state } = useProgress();
  const [progress, setProgress] = useState(4);
  const [onBeat, setOnBeat] = useState(false);
  const [splash, setSplash] = useState(0);
  const [finished, setFinished] = useState(false);

  const progressRef = useRef(progress);
  const finishedRef = useRef(false);
  const lastBeatRef = useRef(0);
  const cheerAtRef = useRef(10);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    void playLine('db_race_intro');
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    lastBeatRef.current = performance.now();

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(48, now - last);
      last = now;

      const sinceBeat = (now - lastBeatRef.current) % BEAT_MS;
      const nearBeat = sinceBeat < BEAT_WINDOW_MS || sinceBeat > BEAT_MS - BEAT_WINDOW_MS;
      setOnBeat(nearBeat);

      if (!finishedRef.current) {
        const next = Math.min(FINISH_AT, progressRef.current + AUTO_SPEED * (dt / 16));
        if (next !== progressRef.current) {
          progressRef.current = next;
          setProgress(next);
        }

        if (next >= cheerAtRef.current && next < FINISH_AT) {
          cheerAtRef.current += 33;
          void playLine('db_race_cheer');
        }

        if (next >= FINISH_AT) {
          finishedRef.current = true;
          setFinished(true);
          playSfx('cheer');
          void playLine('db_race_done');
        }
      }

      // advance beat clock marker for visual pulse alignment
      if (sinceBeat < dt) {
        lastBeatRef.current = now - sinceBeat;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const hitDrum = useCallback(() => {
    if (finishedRef.current) return;
    const now = performance.now();
    const sinceBeat = (now - lastBeatRef.current) % BEAT_MS;
    const nearBeat = sinceBeat < BEAT_WINDOW_MS || sinceBeat > BEAT_MS - BEAT_WINDOW_MS;

    playSfx('drum');
    setSplash((n) => n + 1);

    const step = nearBeat ? HIT_SPEED : MISS_SPEED;
    const next = Math.min(FINISH_AT, progressRef.current + step);
    progressRef.current = next;
    setProgress(next);
  }, []);

  useIdleHint({
    enabled: !finished,
    onIdle: () => void playLine('db_idle'),
  });

  const boatLeft = `${8 + progress * 0.78}%`;

  return (
    <div className={styles.page}>
      <TopBar backTo="theme" themeId="dragonboat" />
      <Subtitle />
      <Confetti active={finished} />
      <div className={styles.progress}>划呀划！{Math.round(progress)}%</div>

      <div className={styles.river}>
        <img className={styles.bg} src={assetPath('dragonboat/race', 'river_bg.svg')} alt="" />
        <div className={styles.boatWrap} style={{ left: boatLeft }}>
          <img className={styles.boat} src={assetPath('dragonboat/race', 'boat.svg')} alt="" />
          {state.profile && (
            <div className={styles.avatar}>
              <Avatar
                head={state.profile.head}
                gender={state.profile.gender}
                outfit="dragonboat"
                size={56}
              />
            </div>
          )}
          {splash > 0 && (
            <span key={splash} className={styles.splash}>
              💦
            </span>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={[styles.drum, onBeat ? styles.drumBeat : ''].join(' ')}
          aria-label="打鼓"
          onClick={hitDrum}
        >
          <img src={assetPath('dragonboat/race', 'drum.svg')} alt="" />
        </button>
      </div>

      {finished && (
        <div className={styles.finish} role="dialog" aria-label="到終點">
          <h2>到終點喇！🎉</h2>
          <BigButton onClick={onComplete}>完成 ✔</BigButton>
        </div>
      )}
    </div>
  );
}
