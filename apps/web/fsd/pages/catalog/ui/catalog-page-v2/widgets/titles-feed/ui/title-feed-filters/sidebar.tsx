import { PropsWithChildren } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { useIsMobile } from '@re/ui-kit/hooks/use-mobile';

import { FILTERS_PANEL_ANIMATION_DURATION } from '../../model/constants';
import { useTitlesFiltersState } from '../../model/context';

export const TitlesFeedSidebarFilters = (props: PropsWithChildren) => {
  const { filtersOpen, setFiltersOpenUI } = useTitlesFiltersState();

  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return (
    <AnimatePresence
      onExitComplete={() => {
        setFiltersOpenUI(false);
      }}
    >
      {filtersOpen && (
        <motion.div
          onAnimationStart={() => {
            setFiltersOpenUI(true);
          }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: FILTERS_PANEL_ANIMATION_DURATION / 1000, ease: 'easeInOut' }}
          className="border-border/50 sticky top-[calc(var(--header-height)+72px)] right-0 z-10 h-[calc(100vh-var(--header-height)-72px)] overflow-hidden border-l md:min-w-[382.4px] xl:min-w-[400px]"
        >
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
