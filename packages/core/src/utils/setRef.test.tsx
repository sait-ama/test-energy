import * as React from 'react';

import { describe, expect, it, vi } from 'vitest';

import { CallbackRef, setRef } from './setRef';

describe('setRef', () => {
  it('calls callback ref with value', () => {
    const cb: CallbackRef<HTMLDivElement> = vi.fn();
    const value = document.createElement('div');
    setRef(cb, value);
    expect(cb).toHaveBeenCalledWith(value);
  });

  it('sets value to object ref', () => {
    const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
    const value = document.createElement('div');
    setRef(ref, value);
    expect(ref.current).toBe(value);
  });

  it('does nothing if ref is null', () => {
    expect(() => setRef(null, document.createElement('div'))).not.toThrow();
  });

  it('does nothing if ref is undefined', () => {
    expect(() => setRef(undefined, document.createElement('div'))).not.toThrow();
  });
});
