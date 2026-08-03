import { useState } from 'react';

import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';

export const useScrollOffsetTrigger = (offset = 0, disabled = false): boolean => {
  const [triggered, setTriggered] = useState<boolean>(false);

  useIsomorphicEffect(() => {
    if (typeof window === 'undefined' || disabled) return;

    function handleScroll() {
      const newTrigger = window.scrollY >= offset;
      if (triggered !== newTrigger) setTriggered(newTrigger);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset, triggered]);

  return triggered;
};
