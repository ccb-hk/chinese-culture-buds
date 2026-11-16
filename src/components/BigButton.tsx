import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import styles from './BigButton.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  playTap?: boolean;
};

export function BigButton({
  children,
  variant = 'primary',
  playTap = true,
  className = '',
  onClick,
  ...rest
}: Props) {
  const { state } = useProgress();
  const variantClass =
    variant === 'secondary' ? styles.secondary : variant === 'ghost' ? styles.ghost : '';

  return (
    <button
      type="button"
      className={[
        styles.button,
        variantClass,
        state.settings.whiteboardMode ? styles.whiteboard : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => {
        if (playTap) playSfx('tap');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
