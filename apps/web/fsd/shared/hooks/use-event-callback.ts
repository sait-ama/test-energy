'use client';
import { useCallback, useRef } from 'react';

import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';

/**
 * Creates a stable callback that can be safely used in effects and event handlers.
 * Ensures the latest callback is always used while maintaining a stable reference.
 * @template Args - The argument types for the callback.
 * @template R - The return type of the callback.
 * @param {(...args: Args) => R} fn - The callback function.
 * @returns {(...args: Args) => R} A memoized event callback function.
 * @public
 * @see [Documentation](https://usehooks-ts.com/react-hook/use-event-callback)
 * @example
 * ```tsx
 * const handleClick = useEventCallback((event) => {
 *   // Handle the event here
 * });
 * ```
 */
export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R;
export function useEventCallback<Args extends unknown[], R>(
  fn: ((...args: Args) => R) | undefined
): ((...args: Args) => R) | undefined;
export function useEventCallback<Args extends unknown[], R>(
  fn: ((...args: Args) => R) | undefined
): ((...args: Args) => R) | undefined {
  const ref = useRef(fn);

  useIsomorphicEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback(
    (...args: Args) => {
      const callback = ref.current;
      if (!callback) return undefined as R;
      return callback(...args);
    },
    [ref]
  ) as (...args: Args) => R;
}
