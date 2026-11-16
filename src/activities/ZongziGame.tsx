import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { Guide } from '../components/Guide';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assetPath } from '../engine/assets';
import { playLine, playSfx } from '../engine/audio';
import { navigate } from '../engine/routing';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './ZongziGame.module.css';

type Ingredient = 'leaf' | 'rice' | 'filling_yolk' | 'filling_redbean' | 'filling_mungbean';
type Phase = 'make' | 'steam' | 'done';

const FILLINGS: Ingredient[] = ['filling_yolk', 'filling_redbean', 'filling_mungbean'];

type Props = {
  onComplete: () => void;
};

export function ZongziGame({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('make');
  const [bowl, setBowl] = useState<Ingredient[]>([]);
  const [hintId, setHintId] = useState<Ingredient | 'string' | null>('leaf');
  const [pose, setPose] = useState<'idle' | 'tilt' | 'cheer'>('idle');
  const [tieReady, setTieReady] = useState(false);
  const [tieHintPlayed, setTieHintPlayed] = useState(false);

  const hasLeaf = bowl.includes('leaf');
  const hasRice = bowl.includes('rice');
  const hasFilling = bowl.some((i) => FILLINGS.includes(i));

  const nextExpected = useMemo(() => {
    if (!hasLeaf) return 'leaf' as const;
    if (!hasRice) return 'rice' as const;
    if (!hasFilling) return 'filling' as const;
    return 'string' as const;
  }, [hasLeaf, hasRice, hasFilling]);

  useEffect(() => {
    void playLine('db_zongzi_intro');
  }, []);

  useEffect(() => {
    if (phase !== 'make') return;
    if (nextExpected === 'leaf') setHintId('leaf');
    else if (nextExpected === 'rice') setHintId('rice');
    else if (nextExpected === 'filling') setHintId('filling_yolk');
    else setHintId('string');
  }, [nextExpected, phase]);

  useEffect(() => {
    if (phase === 'make' && hasFilling && !tieReady) {
      setTieReady(true);
      if (!tieHintPlayed) {
        setTieHintPlayed(true);
        void playLine('db_zongzi_tie');
      }
    }
  }, [hasFilling, phase, tieReady, tieHintPlayed]);

  useIdleHint({
    enabled: phase === 'make',
    onIdle: () => void playLine('db_idle'),
  });

  const tryAdd = (item: Ingredient) => {
    if (phase !== 'make') return;

    const isFilling = FILLINGS.includes(item);
    let ok = false;
    if (item === 'leaf' && !hasLeaf) ok = true;
    else if (item === 'rice' && hasLeaf && !hasRice) ok = true;
    else if (isFilling && hasLeaf && hasRice) ok = true;

    if (!ok) {
      setPose('tilt');
      playSfx('tap');
      if (!hasLeaf) void playLine('db_zongzi_hint_leaf');
      else if (!hasRice) void playLine('db_zongzi_hint_rice');
      else void playLine('db_zongzi_hint_filling');
      setHintId(!hasLeaf ? 'leaf' : !hasRice ? 'rice' : 'filling_yolk');
      window.setTimeout(() => setPose('idle'), 800);
      return;
    }

    playSfx('snap');
    setBowl((prev) => [...prev, item]);
    setPose('idle');
  };

  const tie = () => {
    if (!tieReady || phase !== 'make') return;
    playSfx('success');
    setPhase('steam');
    window.setTimeout(() => {
      setPhase('done');
      setPose('cheer');
      void playLine('db_zongzi_done');
      playSfx('cheer');
    }, 3000);
  };

  const reset = () => {
    setPhase('make');
    setBowl([]);
    setTieReady(false);
    setTieHintPlayed(false);
    setPose('idle');
    setHintId('leaf');
    void playLine('db_zongzi_intro');
  };

  const ingredients: Ingredient[] = [
    'leaf',
    'rice',
    'filling_yolk',
    'filling_redbean',
    'filling_mungbean',
  ];

  return (
    <div className={styles.page}>
      <TopBar backTo="theme" themeId="dragonboat" />
      <Subtitle />
      <h1 className={styles.title}>包糭子小廚師</h1>

      <div className={styles.guide}>
        <Guide id="dongdong" pose={pose} size={120} showName />
      </div>

      <div className={styles.center}>
        {phase === 'steam' && <div className={styles.steam}>💨 蒸緊…</div>}
        {phase === 'done' ? (
          <img
            className={styles.doneImg}
            src={assetPath('dragonboat/zongzi', 'zongzi_done.svg')}
            alt=""
          />
        ) : (
          <div className={styles.bowl} aria-label="大碗">
            <div className={styles.stack}>
              {bowl.map((item, i) => (
                <img
                  key={`${item}-${i}`}
                  src={assetPath('dragonboat/zongzi', `${item}.svg`)}
                  alt=""
                />
              ))}
            </div>
          </div>
        )}

        {phase === 'make' && (
          <button
            type="button"
            className={[styles.stringBtn, tieReady ? styles.stringReady : ''].join(' ')}
            onClick={tie}
            disabled={!tieReady}
          >
            綁繩 🎀
          </button>
        )}
      </div>

      <div className={styles.rack}>
        {ingredients.map((item) => (
          <button
            key={item}
            type="button"
            className={[
              styles.item,
              hintId === item || (hintId === 'filling_yolk' && FILLINGS.includes(item) && !hasFilling)
                ? styles.hintGlow
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={phase !== 'make'}
            onClick={() => tryAdd(item)}
          >
            <img src={assetPath('dragonboat/zongzi', `${item}.svg`)} alt="" />
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        {phase === 'done' ? (
          <>
            <BigButton onClick={onComplete}>完成 ✔</BigButton>
            <BigButton variant="secondary" onClick={reset}>
              再包一隻
            </BigButton>
          </>
        ) : (
          <BigButton
            variant="ghost"
            onClick={() => navigate({ name: 'theme', themeId: 'dragonboat' })}
          >
            離開
          </BigButton>
        )}
      </div>
    </div>
  );
}
