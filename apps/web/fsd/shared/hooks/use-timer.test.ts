import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TimerSubscriptionType, useTimer } from './use-timer';

describe('useTimer', () => {
  it('ticks and stops', () => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame
    let rafCallback: any;
    const mockRAF = vi.fn((cb) => {
      rafCallback = cb;
      return 1;
    });
    global.requestAnimationFrame = mockRAF;

    const { result } = renderHook(() =>
      useTimer({ from: 0, to: 100, timeUnit: 'ms', refreshLimit: 10 })
    );
    expect(result.current.isTicking).toBe(false);
    act(() => result.current.start());

    // Simulate RAF callback execution
    act(() => {
      if (rafCallback) rafCallback(0);
    });
    expect(result.current.isTicking).toBe(true);

    // Simulate timer completion
    act(() => {
      if (rafCallback) rafCallback(110);
    });
    expect(result.current.isTicking).toBe(false);
    vi.useRealTimers();
  });

  it('subscribe/unsubscribe stop', () => {
    vi.useFakeTimers();
    const onStop = vi.fn();
    // Mock requestAnimationFrame
    let rafCallback: any;
    const mockRAF = vi.fn((cb) => {
      rafCallback = cb;
      return 1;
    });
    global.requestAnimationFrame = mockRAF;

    const { result } = renderHook(() =>
      useTimer({ from: 0, to: 50, timeUnit: 'ms', refreshLimit: 10 })
    );
    const key = result.current.subscribe(TimerSubscriptionType.STOP, onStop);
    act(() => result.current.start());

    // Simulate RAF callbacks to complete the timer
    act(() => {
      if (rafCallback) {
        rafCallback(0); // Start
        rafCallback(60); // Complete timer
      }
    });
    expect(onStop).toHaveBeenCalled();
    act(() => result.current.unsubscribe(TimerSubscriptionType.STOP, key));
    vi.useRealTimers();
  });
});
