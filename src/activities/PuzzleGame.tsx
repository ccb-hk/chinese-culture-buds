import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { Guide } from '../components/Guide';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assets } from '../content/assets';
import { playLine, playSfx } from '../engine/audio';
import { useDrag } from '../engine/useDrag';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './PuzzleGame.module.css';

const PIECE = 110;
const FRAME = PIECE * 2;

type PieceId = '0' | '1' | '2' | '3';

const PIECES: PieceId[] = ['0', '1', '2', '3'];

const BG_POS: Record<PieceId, string> = {
  '0': '0% 0%',
  '1': '100% 0%',
  '2': '0% 100%',
  '3': '100% 100%',
};

const SLOT_OFFSET: Record<PieceId, { x: number; y: number }> = {
  '0': { x: 0, y: 0 },
  '1': { x: PIECE, y: 0 },
  '2': { x: 0, y: PIECE },
  '3': { x: PIECE, y: PIECE },
};

type Props = {
  onComplete: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildInitialPositions(boardW: number, boardH: number) {
  const frameTop = (boardH - FRAME) / 2;
  const order = shuffle(PIECES);
  const positions: Record<string, { x: number; y: number }> = {};
  order.forEach((id, i) => {
    const leftSide = i < 2;
    positions[id] = {
      x: leftSide ? 8 : boardW - PIECE - 8,
      y: frameTop + (i % 2) * (PIECE + 16),
    };
  });
  return positions;
}

export function PuzzleGame({ onComplete }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [snappedCount, setSnappedCount] = useState(0);
  const [boardSize] = useState({ w: 520, h: 360 });
  const [deal, setDeal] = useState(0);

  const puzzleIndexRef = useRef(puzzleIndex);
  useEffect(() => {
    puzzleIndexRef.current = puzzleIndex;
  }, [puzzleIndex]);

  const imageSrc =
    puzzleIndex === 0 ? assets.midautumn.puzzle.puzzle1 : assets.midautumn.puzzle.puzzle2;

  const frameOrigin = useMemo(
    () => ({
      x: (boardSize.w - FRAME) / 2,
      y: (boardSize.h - FRAME) / 2,
    }),
    [boardSize.h, boardSize.w],
  );

  const targets = useMemo(
    () =>
      PIECES.map((id) => ({
        id,
        center: {
          x: frameOrigin.x + SLOT_OFFSET[id].x + PIECE / 2,
          y: frameOrigin.y + SLOT_OFFSET[id].y + PIECE / 2,
        },
        width: PIECE,
      })),
    [frameOrigin.x, frameOrigin.y],
  );

  const initial = useMemo(
    () => buildInitialPositions(boardSize.w, boardSize.h),
    [boardSize.h, boardSize.w, puzzleIndex, deal],
  );

  const onSnap = useCallback(() => {
    playSfx('snap');
    void playLine('ma_puzzle_good');
    setSnappedCount((n) => n + 1);
  }, []);

  const onMiss = useCallback(() => {
    void playLine('ma_puzzle_retry');
  }, []);

  const { bindDrag, resetPositions } = useDrag({
    initial,
    targets,
    itemSize: { width: PIECE, height: PIECE },
    matchTarget: (pieceId, targetId) => pieceId === targetId,
    onSnap,
    onMiss,
  });

  useEffect(() => {
    resetPositions(initial);
    void playLine(puzzleIndex === 0 ? 'ma_puzzle_intro' : 'ma_puzzle_next');
  }, [puzzleIndex, deal, initial, resetPositions]);

  useEffect(() => {
    if (snappedCount < 4) return;
    setCelebrate(true);
    playSfx('cheer');
    const t = window.setTimeout(() => {
      if (puzzleIndexRef.current === 0) {
        setCelebrate(false);
        setSnappedCount(0);
        setPuzzleIndex(1);
        setDeal((d) => d + 1);
      } else {
        onComplete();
      }
    }, 1600);
    return () => window.clearTimeout(t);
  }, [snappedCount, onComplete]);

  useIdleHint({
    enabled: snappedCount < 4 && !celebrate,
    onIdle: () => void playLine('ma_idle'),
  });

  return (
    <div className={`${styles.page} ${celebrate ? styles.celebrate : ''}`}>
      <TopBar backTo="theme" themeId="midautumn" />
      <Subtitle />
      <Guide id="puff" pose={celebrate ? 'cheer' : 'talk'} size={90} />
      <h1 className={styles.title}>中秋團圓小拼圖（{puzzleIndex + 1}/2）</h1>
      {celebrate && <div className={styles.doneBanner}>拼好啦！</div>}

      <div
        className={`${styles.board} drag-surface`}
        style={{ width: boardSize.w, height: boardSize.h, ['--piece' as string]: `${FRAME}px` }}
      >
        <div className={styles.frame} style={{ width: FRAME, height: FRAME }}>
          <div
            className={styles.ghost}
            style={{ backgroundImage: `url(${imageSrc})` }}
            aria-hidden
          />
          {PIECES.map((id) => (
            <div
              key={`slot-${id}`}
              className={styles.slot}
              style={{
                left: SLOT_OFFSET[id].x,
                top: SLOT_OFFSET[id].y,
                width: PIECE,
                height: PIECE,
              }}
            />
          ))}
        </div>

        {PIECES.map((id) => {
          const bind = bindDrag(id);
          return (
            <div
              key={`${puzzleIndex}-${deal}-${id}`}
              className={styles.piece}
              {...bind}
              style={{
                ...bind.style,
                backgroundImage: `url(${imageSrc})`,
                backgroundPosition: BG_POS[id],
              }}
            />
          );
        })}
      </div>

      <BigButton
        variant="ghost"
        onClick={() => {
          setSnappedCount(0);
          setCelebrate(false);
          setDeal((d) => d + 1);
        }}
      >
        重設呢幅
      </BigButton>
    </div>
  );
}
