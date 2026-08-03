import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useEventCallback } from './use-event-callback';

describe('useEventCallback', () => {
  it('returns stable callback that calls latest fn', () => {
    const fn1 = (x: number) => x + 1;
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: fn1 },
    });

    expect(result.current(1)).toBe(2);
    const fn2 = (x: number) => x + 2;
    rerender({ fn: fn2 });
    expect(result.current(1)).toBe(3);
  });
});
