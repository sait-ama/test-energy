import type { MutableRefObject, RefCallback } from 'react';
import { useCallback } from 'react';

type RefType<T> = MutableRefObject<T | null> | RefCallback<T> | null | undefined;

/**
 * Combines two refs into a single ref callback.
 * Useful when you need to use both a ref from props and an internal ref.
 */
export default function useForkRef<T>(refA: RefType<T>, refB: RefType<T>): RefCallback<T> | null {
  return useCallback(
    (instance: T | null) => {
      // Handle first ref
      if (refA) {
        if (typeof refA === 'function') {
          refA(instance);
        } else {
          refA.current = instance;
        }
      }

      // Handle second ref
      if (refB) {
        if (typeof refB === 'function') {
          refB(instance);
        } else {
          refB.current = instance;
        }
      }
    },
    [refA, refB]
  );
}
