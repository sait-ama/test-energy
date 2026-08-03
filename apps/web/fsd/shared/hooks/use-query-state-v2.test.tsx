import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useQueryState as useQueryStateV2 } from './use-query-state-v2';

vi.mock('next/navigation', () => ({
  usePathname: () => '/p',
  useSearchParams: () => new URLSearchParams('a=1'),
}));

vi.mock('@bprogress/next', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

describe('useQueryState v2', () => {
  it('returns value from url and updates via router', () => {
    const { result } = renderHook(() =>
      useQueryStateV2<number>({
        key: 'a',
        defaultValue: '0',
        serializer: (v) => String(v),
        deserializer: (v) => Number(v),
      })
    );
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
  });
});
