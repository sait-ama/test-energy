'use client';
import * as React from 'react';

import { useIsomorphicEffect as useLayoutEffect } from '~shared/hooks/use-isomorphic-effect';

//is_arabic
export function useRtl() {
  const [isRTL, setIsRTL] = React.useState(false);

  useLayoutEffect(() => {
    setIsRTL(window.getComputedStyle(window.document.documentElement).direction === 'rtl');
  }, []);

  return isRTL;
}
