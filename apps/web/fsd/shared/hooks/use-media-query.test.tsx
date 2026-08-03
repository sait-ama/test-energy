import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from './use-media-query';

describe('useMediaQuery', () => {
  it('subscribes to matchMedia and updates', () => {
    const listeners: Record<string, (e: any) => void> = {};
    // @ts-ignore
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (ev: string, cb: any) => (listeners[ev] = cb),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => useMediaQuery('(min-width: 1px)'));
    expect(result.current).toBe(false);
    act(() => listeners.change?.({ matches: true }));
    expect(result.current).toBe(true);
  });
});
