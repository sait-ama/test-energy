'use client';

import { useInsertionEffect, useRef } from 'react';

/**
 * Returns a ref that contains the previous value of the given value
 * @param value the value to track
 * @returns a ref that contains the previous value
 */
export function usePreviousValue<T>(value: T) {
  const valueRef = useRef<T>(value);

  useInsertionEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}
