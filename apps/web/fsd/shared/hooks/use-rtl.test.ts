import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRtl } from './use-rtl';

describe('useRtl', () => {
  it('reads document direction', () => {
    const orig = window.getComputedStyle;
    // @ts-ignore
    window.getComputedStyle = (_: any) => ({ direction: 'rtl' }) as any;
    const { result } = renderHook(() => useRtl());
    expect(result.current).toBe(true);
    window.getComputedStyle = orig;
  });
});
