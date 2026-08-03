import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCookieState } from './use-cookie-state';

vi.mock('~shared/utils/cookie-service', () => ({
  CookieService: {
    get: (k: string) => (k === 'k' ? '"a"' : undefined),
    set: vi.fn(),
  },
}));

describe('useCookieState', () => {
  it('reads initial value from cookie and sets cookie on update', () => {
    const { result } = renderHook(() => useCookieState('k', 'x'));
    expect(result.current[0]).toBe('a');
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
  });
});
