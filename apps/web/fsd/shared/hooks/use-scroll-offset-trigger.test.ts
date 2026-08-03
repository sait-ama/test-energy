import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useScrollOffsetTrigger } from './use-scroll-offset-trigger';

describe('useScrollOffsetTrigger', () => {
  it('triggers when scroll crosses offset', () => {
    const { result } = renderHook(() => useScrollOffsetTrigger(10));
    expect(result.current).toBe(false);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 20, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(true);
  });
});
