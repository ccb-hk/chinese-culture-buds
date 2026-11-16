import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StoryConfig, StoryHotspot } from '../content/stories';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assetPath } from '../engine/assets';
import {
  pauseVoice,
  playLine,
  playSfx,
  resumeVoice,
  speakText,
  stopNarration,
} from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './StoryPlayer.module.css';

const AUTO_CONTINUE_MS = 10000;

type Props = {
  story: StoryConfig;
  onComplete: () => void;
};

type HotspotState = Record<string, { done: boolean; glow?: boolean; bounce?: number; taps?: number }>;

export function StoryPlayer({ story, onComplete }: Props) {
  const { state } = useProgress();
  const lang = state.profile?.lang ?? 'yue';
  const name = state.profile?.name ?? '小朋友';

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [narrationDone, setNarrationDone] = useState(false);
  const [interactions, setInteractions] = useState(0);
  const [hotspots, setHotspots] = useState<HotspotState>({});
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);

  const pausedRef = useRef(paused);
  const indexRef = useRef(index);
  const advancingRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const scene = story.scenes[index];
  const required = scene?.requiredInteractions ?? 0;
  const idleLine = story.idleLine ?? 'common_idle';

  const remainingHotspots = useMemo(() => {
    return (scene?.hotspots ?? []).filter((h) => {
      if (h.kind === 'sun_wiggle' || h.kind === 'label_bounce' || h.kind === 'character_wave') {
        return true;
      }
      if (h.kind === 'tap_progress') return interactions < required;
      return !hotspots[h.id]?.done;
    });
  }, [scene, hotspots, interactions, required]);

  const goNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    stopNarration();

    const next = indexRef.current + 1;
    if (next >= story.scenes.length) {
      onComplete();
      advancingRef.current = false;
      return;
    }
    setIndex(next);
    setNarrationDone(false);
    setInteractions(0);
    setHotspots({});
    setShowHint(false);
    setPaused(false);
    setSceneKey((k) => k + 1);
    advancingRef.current = false;
  }, [onComplete, story.scenes.length]);

  useEffect(() => {
    if (!scene) return;
    let cancelled = false;
    setNarrationDone(false);
    setShowHint(false);

    void (async () => {
      await playLine(scene.lineId, { name });
      if (cancelled) return;
      setNarrationDone(true);
    })();

    return () => {
      cancelled = true;
      stopNarration();
    };
  }, [scene, name, sceneKey]);

  useEffect(() => {
    if (!scene || !narrationDone || paused) return;

    if (required > 0 && interactions >= required) {
      const t = window.setTimeout(() => goNext(), 700);
      return () => window.clearTimeout(t);
    }

    if (required > 0 && interactions < required) {
      const t = window.setTimeout(() => {
        if (!pausedRef.current) goNext();
      }, AUTO_CONTINUE_MS);
      return () => window.clearTimeout(t);
    }

    if (scene.autoAdvance || required === 0) {
      const t = window.setTimeout(() => {
        if (!pausedRef.current) goNext();
      }, 1400);
      return () => window.clearTimeout(t);
    }
  }, [scene, narrationDone, paused, required, interactions, goNext]);

  useIdleHint({
    enabled: !paused && narrationDone && required > 0 && interactions < required,
    onIdle: () => {
      setShowHint(true);
      void playLine(idleLine);
    },
  });

  const onHotspot = (spot: StoryHotspot) => {
    if (paused) return;
    if ((spot.kind === 'sun_dismiss' || spot.kind === 'star_glow') && hotspots[spot.id]?.done) {
      return;
    }

    playSfx(spot.kind === 'tap_progress' ? 'drum' : 'tap');

    if (spot.kind === 'sun_wiggle' || spot.kind === 'character_wave') {
      setWiggleId(spot.id);
      window.setTimeout(() => setWiggleId(null), 600);
      return;
    }

    if (spot.kind === 'sun_dismiss') {
      setHotspots((prev) => ({ ...prev, [spot.id]: { done: true } }));
      setInteractions((n) => n + 1);
      playSfx('snap');
      return;
    }

    if (spot.kind === 'star_glow') {
      setHotspots((prev) => ({ ...prev, [spot.id]: { done: true, glow: true } }));
      setInteractions((n) => n + 1);
      playSfx('success');
      return;
    }

    if (spot.kind === 'tap_progress') {
      setWiggleId(spot.id);
      window.setTimeout(() => setWiggleId(null), 250);
      setInteractions((n) => n + 1);
      playSfx('drum');
      return;
    }

    if (spot.kind === 'label_bounce') {
      const label = spot.label?.[lang] ?? '';
      setHotspots((prev) => ({
        ...prev,
        [spot.id]: { done: false, bounce: Date.now() },
      }));
      if (label) void speakText(label, lang);
    }
  };

  const togglePause = () => {
    setPaused((p) => {
      const next = !p;
      if (next) pauseVoice();
      else resumeVoice();
      playSfx('tap');
      return next;
    });
  };

  if (!scene) return null;

  const hintSpot = remainingHotspots.find(
    (h) =>
      h.kind === 'sun_dismiss' ||
      h.kind === 'star_glow' ||
      h.kind === 'tap_progress',
  );

  const playerOutfit = scene.playerOutfit ?? 'daily';

  return (
    <div className={styles.page}>
      <TopBar backTo="theme" themeId={story.themeId} />
      <Subtitle />
      <div className={styles.progress}>
        {index + 1} / {story.scenes.length}
      </div>

      <div className={styles.stage}>
        <img className={styles.bg} src={assetPath(scene.bg)} alt="" />
        {scene.fg && <img className={styles.fg} src={assetPath(scene.fg)} alt="" />}

        {(scene.characters ?? []).map((ch) => (
          <motion.img
            key={ch.id}
            className={styles.character}
            src={assetPath('characters', `${ch.id}.svg`)}
            alt=""
            style={{
              right: ch.right,
              left: ch.left,
              bottom: ch.bottom ?? '10%',
              width: ch.width ?? 'min(28vw, 220px)',
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {scene.showPlayer && state.profile && (
          <div className={styles.player}>
            <Avatar
              head={state.profile.head}
              gender={state.profile.gender}
              outfit={playerOutfit}
              size={110}
            />
          </div>
        )}

        {(scene.hotspots ?? []).map((spot) => {
          const st = hotspots[spot.id];
          const gone = spot.kind === 'sun_dismiss' && st?.done;
          const emoji = spot.emoji ?? '⭐';

          return (
            <motion.button
              key={spot.id}
              type="button"
              className={[
                styles.hotspot,
                gone ? styles.hotspotGone : '',
                st?.glow ? styles.glow : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: spot.size ?? 88,
                height: spot.size ?? 88,
              }}
              aria-label={spot.label?.[lang] ?? spot.id}
              onClick={() => onHotspot(spot)}
              animate={
                wiggleId === spot.id
                  ? { rotate: [-8, 8, -6, 6, 0], scale: [1, 1.12, 1] }
                  : st?.bounce
                    ? { scale: [1, 1.25, 1] }
                    : { scale: 1 }
              }
              transition={{ duration: 0.45 }}
            >
              {emoji}
            </motion.button>
          );
        })}

        {showHint && hintSpot && (
          <div
            className={styles.hintFinger}
            style={{ left: `${hintSpot.x}%`, top: `${hintSpot.y}%` }}
          >
            👆
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <BigButton variant="secondary" onClick={togglePause}>
          {paused ? '▶' : '⏸'}
        </BigButton>
        <BigButton
          variant="secondary"
          onClick={() => {
            playSfx('tap');
            goNext();
          }}
        >
          下一頁 ⏭
        </BigButton>
        <BigButton
          variant="ghost"
          onClick={() => {
            stopNarration();
            navigate({ name: 'theme', themeId: story.themeId });
          }}
        >
          離開
        </BigButton>
      </div>
    </div>
  );
}
