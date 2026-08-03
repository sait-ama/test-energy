'use client';

import { useRef, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { FilterSliderProvider, type Screen } from '../model/context';
import {
  ExcludeFiltersScreen,
  ExtendedFiltersScreen,
  FilterScreen,
  RootScreen,
} from './filter-screens';

type TitlesFeedFiltersContentProps = {
  presetsButtonSlot?: React.ReactNode;
};

export const TitlesFeedFiltersContent = (props: TitlesFeedFiltersContentProps) => {
  const { presetsButtonSlot } = props;
  const screenStack = useRef<Screen[]>([]);
  const [screen, setScreen] = useState<Screen>('root');
  const [direction, setDirection] = useState<'forward' | 'backward' | null>(null);

  const handleScreenChange = (newScreen: Screen) => {
    screenStack.current.push(screen);
    setDirection('forward');
    setScreen(newScreen);
  };

  const handleGoBack = () => {
    const previousScreen = screenStack.current.pop();
    if (previousScreen) {
      setDirection('backward');
      setScreen(previousScreen);
    }
  };

  const renderContent = () => {
    if (screen === 'root') return <RootScreen presetsButtonSlot={presetsButtonSlot} />;
    if (screen === 'extended_filters') return <ExtendedFiltersScreen />;
    if (screen === 'exclude_filters') return <ExcludeFiltersScreen />;
    return <FilterScreen field={screen} />;
  };

  const slideVariants = {
    forward: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 },
    },
    backward: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 },
    },
  };

  const currentVariant = direction === 'backward' ? slideVariants.backward : slideVariants.forward;

  return (
    <FilterSliderProvider value={{ screen, setScreen: handleScreenChange, goBack: handleGoBack }}>
      <AnimatePresence mode="popLayout" custom={direction}>
        {direction === null ? (
          // Начальный экран без анимации
          <div key={screen}>{renderContent()}</div>
        ) : (
          <motion.div
            key={screen}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{
              ease: 'easeInOut',
              duration: 0.225,
            }}
            className="flex h-full max-h-full w-full flex-col"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </FilterSliderProvider>
  );
};
