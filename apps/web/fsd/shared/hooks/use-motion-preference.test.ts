import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useMotionPreference } from './use-motion-preference';

describe('useMotionPreference', () => {
  it('tracks prefers-reduced-motion', () => {
    const listeners: Record<string, (e: any) => void> = {};
    // @ts-ignore
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (ev: string, cb: any) => (listeners[ev] = cb),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => useMotionPreference());
    expect(result.current).toBe(false);
    act(() => listeners.change?.({ matches: true }));
    expect(result.current).toBe(true);
  });
});
