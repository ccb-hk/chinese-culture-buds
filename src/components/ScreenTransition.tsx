import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  routeKey: string;
  children: ReactNode;
};

export function ScreenTransition({ routeKey, children }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        style={{ width: '100%', height: '100%' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
