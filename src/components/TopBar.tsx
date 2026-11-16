import { playSfx } from '../engine/audio';
import { navigate } from '../engine/routing';
import { useProgress } from '../engine/progress';
import styles from './TopBar.module.css';

type Props = {
  backTo?: 'start' | 'map' | 'theme';
  themeId?: string;
  showBack?: boolean;
};

export function TopBar({ backTo = 'map', themeId, showBack = true }: Props) {
  const { state, dispatch } = useProgress();
  const wb = state.settings.whiteboardMode;

  const goBack = () => {
    playSfx('tap');
    if (backTo === 'start') {
      navigate({ name: 'start' });
      return;
    }
    if (backTo === 'theme' && themeId) {
      navigate({ name: 'theme', themeId });
      return;
    }
    navigate({ name: 'map' });
  };

  return (
    <header className={[styles.bar, wb ? styles.whiteboard : ''].filter(Boolean).join(' ')}>
      {showBack ? (
        <button type="button" className={styles.iconBtn} aria-label="返回" onClick={goBack}>
          ←
        </button>
      ) : (
        <span />
      )}

      <div className={styles.right}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={state.settings.sound ? '靜音' : '開啟聲音'}
          onClick={() => {
            dispatch({
              type: 'UPDATE_SETTINGS',
              patch: { sound: !state.settings.sound },
            });
            playSfx('tap');
          }}
        >
          {state.settings.sound ? '🔊' : '🔇'}
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={state.settings.subtitles ? '關閉字幕' : '開啟字幕'}
          onClick={() => {
            dispatch({
              type: 'UPDATE_SETTINGS',
              patch: { subtitles: !state.settings.subtitles },
            });
            playSfx('tap');
          }}
        >
          {state.settings.subtitles ? '字' : '字̸'}
        </button>
      </div>
    </header>
  );
}
