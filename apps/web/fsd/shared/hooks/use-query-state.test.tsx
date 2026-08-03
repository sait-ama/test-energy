import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useQueryState } from './use-query-state';

vi.mock('next/navigation', () => ({
  usePathname: () => '/p',
  useSearchParams: () => new URLSearchParams('a=1'),
}));

vi.mock('@bprogress/next', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

describe('useQueryState', () => {
  it('reads from search params and updates', () => {
    const { result } = renderHook(() =>
      useQueryState<number>({
        key: 'a',
        initialValue: 0,
        serializer: (v) => String(v),
        deserializer: (v) => Number(v),
      })
    );
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
  });
});
