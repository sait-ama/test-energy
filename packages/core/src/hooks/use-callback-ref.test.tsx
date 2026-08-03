import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCallbackRef } from './use-callback-ref';

describe('useCallbackRef', () => {
  it('calls latest callback', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(({ callback }) => useCallbackRef(callback), {
      initialProps: { callback: cb },
    });
    act(() => {
      result.current('foo');
    });
    expect(cb).toHaveBeenCalledWith('foo');
    const cb2 = vi.fn();
    rerender({ callback: cb2 });
    act(() => {
      result.current('bar');
    });
    expect(cb2).toHaveBeenCalledWith('bar');
  });

  it('returns stable function', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(({ callback }) => useCallbackRef(callback), {
      initialProps: { callback: cb },
    });
    const first = result.current;
    rerender({ callback: () => {} });
    expect(result.current).toBe(first);
  });
});
