import * as React from 'react';

export type CallbackRef<T> = (instance: T | null) => void;

export function setRef<T>(
  ref: React.RefObject<T | null> | CallbackRef<T> | null | undefined,
  value: T | null
): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
