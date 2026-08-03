import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOnReroute } from './use-on-reroute';

let path = '/a';
vi.mock('next/navigation', () => ({
  usePathname: () => path,
}));

describe('useOnReroute', () => {
  it('calls callback when pathname changes', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(() => useOnReroute(cb));
    expect(cb).toHaveBeenCalledTimes(1);
    path = '/b';
    rerender();
    expect(cb).toHaveBeenCalledTimes(2);
  });
});
