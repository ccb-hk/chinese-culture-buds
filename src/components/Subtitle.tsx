import { useEffect, useState } from 'react';
import { onSubtitle } from '../engine/audio';
import { useProgress } from '../engine/progress';
import styles from './Subtitle.module.css';

type Props = {
  /** Override live audio subtitle with a fixed string. */
  text?: string | null;
};

export function Subtitle({ text }: Props) {
  const { state } = useProgress();
  const [live, setLive] = useState<string | null>(null);

  useEffect(() => onSubtitle(setLive), []);

  const content = text !== undefined ? text : live;
  const visible = state.settings.subtitles && Boolean(content);

  return (
    <div
      className={[
        styles.bar,
        state.settings.whiteboardMode ? styles.whiteboard : '',
        visible ? '' : styles.hidden,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  );
}
