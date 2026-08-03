import { useCallback } from 'react';

import throttle from 'lodash.throttle';

/** @deprecated - use `useThrottle` from `~shared/hook/v2/use-throttle` instead */
export const useThrottle = (func: (...args: any) => any, wait = 16, options?: {}) =>
  useCallback(throttle(func, wait, options), []);
