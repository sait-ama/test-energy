import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useThrottle } from './use-throttle';

describe('useThrottle', () => {
  it('throttles function calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 100));
    act(() => {
      result.current();
      result.current();
    });
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(100));
    result.current();
    expect(fn).toHaveBeenCalledTimes(3); // throttle can execute at leading, trailing, and after timeout
    vi.useRealTimers();
  });
});
