import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCookie } from './use-cookie';

vi.mock('~shared/utils/cookie-service', () => ({
  CookieService: {
    get: (k: string) => (k === 'x' ? '1' : undefined),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useCookie', () => {
  it('reads, sets and deletes cookie', () => {
    const { result } = renderHook(() => useCookie('x'));
    expect(result.current[0]).toBe('1');
    act(() => result.current[1]('2'));
    expect(result.current[0]).toBe('2');
    act(() => result.current[2]());
    expect(result.current[0]).toBeNull();
  });
});
