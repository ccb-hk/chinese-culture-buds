import { useMemo, useState } from 'react';
import { themes } from '../content/themes';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assetPath } from '../engine/assets';
import { playLine, playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import styles from './MapScreen.module.css';

/** Approximate pin positions on the map (percent). */
const PIN_POS: Record<string, { left: string; top: string }> = {
  newyear: { left: '16%', top: '68%' },
  midautumn: { left: '40%', top: '58%' },
  dragonboat: { left: '63%', top: '68%' },
  yumcha: { left: '85%', top: '60%' },
};

export function MapScreen() {
  const { state } = useProgress();
  const profile = state.profile;
  const [playerPos, setPlayerPos] = useState(PIN_POS.midautumn);
  const [moving, setMoving] = useState(false);

  const name = profile?.name ?? '小朋友';

  const pins = useMemo(
    () =>
      themes.map((theme) => ({
        theme,
        pos: PIN_POS[theme.id] ?? { left: '50%', top: '50%' },
        locked: theme.status === 'coming_soon',
        done: Boolean(state.stickers[theme.id]),
      })),
    [state.stickers],
  );

  const goTheme = (themeId: string, locked: boolean, pos: { left: string; top: string }) => {
    if (moving) return;
    playSfx('tap');
    setMoving(true);
    setPlayerPos(pos);

    window.setTimeout(() => {
      setMoving(false);
      if (locked) {
        playLine('common_coming_soon');
        return;
      }
      navigate({ name: 'theme', themeId });
    }, 750);
  };

  return (
    <div className={styles.page}>
      <TopBar backTo="start" />
      <Subtitle />

      <div className={styles.stage}>
        <div className={styles.world}>
          <img className={styles.bg} src={assetPath('map', 'map_bg.svg')} alt="" />

          {pins.map(({ theme, pos, locked, done }) => (
            <button
              key={theme.id}
              type="button"
              className={[styles.pin, locked ? styles.locked : ''].filter(Boolean).join(' ')}
              style={{ left: pos.left, top: pos.top }}
              aria-label={theme.title.yue + (locked ? '（即將推出）' : '')}
              onClick={() => goTheme(theme.id, locked, pos)}
            >
              {locked && <span className={styles.fog} />}
              <img src={assetPath('map', `pin_${theme.mapPin}.svg`)} alt="" />
              {locked && <span className={styles.lockBadge}>🔒</span>}
              {done && (
                <img
                  className={styles.doneBadge}
                  src={assetPath('stickers', `${theme.id}.svg`)}
                  alt=""
                />
              )}
            </button>
          ))}

          {profile && (
            <div className={styles.player} style={{ left: playerPos.left, top: playerPos.top }}>
              <Avatar
                head={profile.head}
                gender={profile.gender}
                outfit="daily"
                size={88}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.stickersBtn}>
        <BigButton variant="secondary" onClick={() => navigate({ name: 'stickers' })}>
          貼紙簿
        </BigButton>
      </div>

      {!profile && (
        <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center' }}>
          <BigButton onClick={() => navigate({ name: 'avatar' })}>先建立角色（{name}）</BigButton>
        </div>
      )}
    </div>
  );
}
