import { useEffect, useMemo, useState } from 'react';
import { accessConfig, isActivityLocked } from '../config/access';
import { appConfig } from '../config/app';
import { getTheme } from '../content/themes';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Guide } from '../components/Guide';
import { ParentGate } from '../components/ParentGate';
import { StickerReward } from '../components/StickerReward';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { playLine, playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './ThemeHome.module.css';

type Props = { themeId: string };

const ACTIVITY_ICON: Record<string, string> = {
  story: '▶',
  lantern: '🏮',
  puzzle: '🧩',
  zongzi: '🍙',
  race: '🐉',
};

export function ThemeHome({ themeId }: Props) {
  const theme = getTheme(themeId);
  const { state, dispatch } = useProgress();
  const lang = state.profile?.lang ?? 'yue';
  const name = state.profile?.name ?? '小朋友';
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lockFlow, setLockFlow] = useState<'none' | 'gate' | 'survey' | 'paid'>('none');

  const completedAll = useMemo(() => {
    if (!theme || theme.activities.length === 0) return false;
    return theme.activities.every((a) => state.completed[a.id]);
  }, [theme, state.completed]);

  useEffect(() => {
    if (!theme) return;
    if (theme.status === 'coming_soon') {
      playLine('common_coming_soon');
      return;
    }
    playLine(theme.welcomeLine, { name });
  }, [theme, name]);

  useEffect(() => {
    if (!theme || !completedAll) return;
    if (state.stickers[theme.id]) return;
    dispatch({ type: 'UNLOCK_STICKER', themeId: theme.id });
    playLine(theme.completeLine, { name });
    playSfx('cheer');
    setRewardOpen(true);
  }, [completedAll, theme, dispatch, name, state.stickers]);

  useIdleHint({
    enabled: Boolean(theme) && theme?.status === 'ready' && !rewardOpen && lockFlow === 'none',
    onIdle: () => {
      if (theme) playLine(theme.welcomeLine, { name });
    },
  });

  if (!theme) {
    return (
      <div className={styles.page}>
        <TopBar backTo="map" />
        <p className={styles.soon}>搵唔到呢個主題</p>
      </div>
    );
  }

  if (theme.status === 'coming_soon') {
    return (
      <div className={styles.page}>
        <TopBar backTo="map" />
        <Subtitle />
        <h1 className={styles.title}>{theme.title[lang]}</h1>
        <Guide id={theme.guide} pose="tilt" size={160} showName />
        <p className={styles.soon}>即將推出，好快就會開放㗎！</p>
      </div>
    );
  }

  const openActivity = (activityId: string, index: number) => {
    playSfx('tap');
    const locked = isActivityLocked(index, state.surveyUnlocked);
    if (locked) {
      if (accessConfig.mode === 'paid') {
        setLockFlow('paid');
        return;
      }
      setLockFlow('gate');
      return;
    }
    navigate({ name: 'activity', themeId: theme.id, activityId });
  };

  return (
    <div className={styles.page}>
      <TopBar backTo="map" />
      <Subtitle />

      <div className={styles.hero}>
        <Guide id={theme.guide} pose="talk" size={150} showName />
        {state.profile && (
          <Avatar
            head={state.profile.head}
            gender={state.profile.gender}
            outfit={theme.outfit}
            size={120}
          />
        )}
      </div>

      <h1 className={styles.title}>{theme.title[lang]}</h1>

      <div className={styles.cards}>
        {theme.activities.map((activity, index) => {
          const done = Boolean(state.completed[activity.id]);
          const locked = isActivityLocked(index, state.surveyUnlocked);
          return (
            <button
              key={activity.id}
              type="button"
              className={[styles.card, locked ? styles.cardLocked : ''].filter(Boolean).join(' ')}
              onClick={() => openActivity(activity.id, index)}
            >
              <span className={styles.icon}>{ACTIVITY_ICON[activity.type] ?? '🎮'}</span>
              <span>{activity.title[lang]}</span>
              {done && !locked && <span className={styles.check}>✓</span>}
              {locked && <span className={styles.lock}>🔒</span>}
            </button>
          );
        })}
      </div>

      <StickerReward
        open={rewardOpen}
        themeId={theme.id}
        title={theme.sticker.name[lang]}
      />

      <ParentGate
        open={lockFlow === 'gate'}
        title="解鎖更多內容"
        description="請家長按住 3 秒，然後填寫問卷解鎖（以信任為本，唔會核實）。"
        onSuccess={() => setLockFlow('survey')}
        onCancel={() => setLockFlow('none')}
      />

      {lockFlow === 'survey' && (
        <div className={styles.lockPanel} role="dialog" aria-label="問卷解鎖">
          <h2>填寫問卷解鎖</h2>
          <p>開啟問卷後，返嚟撳「我已填寫問卷」就可以繼續玩其餘活動。</p>
          <BigButton
            onClick={() => window.open(appConfig.surveyUrl, '_blank', 'noopener,noreferrer')}
          >
            開啟問卷
          </BigButton>
          <BigButton
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'SET_SURVEY_UNLOCKED', value: true });
              playSfx('success');
              setLockFlow('none');
            }}
          >
            我已填寫問卷
          </BigButton>
          <BigButton variant="ghost" onClick={() => setLockFlow('none')}>
            取消
          </BigButton>
        </div>
      )}

      {lockFlow === 'paid' && (
        <div className={styles.lockPanel} role="dialog" aria-label="敬請期待">
          <h2>敬請期待</h2>
          <p>{appConfig.paidComingSoon[lang]}</p>
          <BigButton variant="secondary" onClick={() => setLockFlow('none')}>
            知道喇
          </BigButton>
        </div>
      )}
    </div>
  );
}
