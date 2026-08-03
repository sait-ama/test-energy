import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  it('debounces value and supports leading', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ v, leading }) => useDebouncedValue(v, 100, { leading }),
      {
        initialProps: { v: 0, leading: false },
      }
    );

    rerender({ v: 1, leading: false });
    act(() => vi.advanceTimersByTime(99));
    expect(result.current[0]).toBe(0);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current[0]).toBe(1);

    rerender({ v: 2, leading: true });
    expect(result.current[0]).toBe(2);
    vi.useRealTimers();
  });
});
