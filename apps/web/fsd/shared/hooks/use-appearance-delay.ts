import { startTransition, useEffect, useState } from 'react';

export const useAppearanceDelay = (
  show?: boolean,
  options = {} as {
    defaultValue?: boolean;
    appearanceDelay?: number;
    minDisplay?: number;
  }
): boolean => {
  const { minDisplay = 500, defaultValue = false, appearanceDelay = 500 } = options;

  const [delayedShow, setDelayedShow] = useState(defaultValue);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        startTransition(() => {
          setDelayedShow(true);
        });
      }, appearanceDelay);
      return () => {
        clearTimeout(timer);
      };
    } else {
      const timer = setTimeout(() => {
        startTransition(() => {
          setDelayedShow(false);
        });
      }, minDisplay);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [appearanceDelay, show, minDisplay]);

  return delayedShow;
};
