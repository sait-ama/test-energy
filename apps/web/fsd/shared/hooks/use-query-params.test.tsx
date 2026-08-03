import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useQueryArrayParams, useQueryParamsV2, useQueryPrimitiveParams } from './use-query-params';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/p',
  useSearchParams: () => new URLSearchParams('a=1&a=2&b=x'),
}));
vi.mock('@bprogress/next', () => ({ useRouter: () => ({ push }) }));

describe('useQuery-params', () => {
  it('primitive param reads default and sets', () => {
    const { result } = renderHook(() =>
      useQueryPrimitiveParams<{ b?: string }>({ fieldName: 'b', defaultValue: 'x' })
    );
    expect(result.current.value).toBe('x');
    act(() => result.current.setValue('y'));
    expect(push).toHaveBeenCalled();
  });

  it('array params push/delete/set', () => {
    const { result } = renderHook(() => useQueryArrayParams({ fieldName: 'a' }));
    expect(result.current.value).toEqual(['1', '2']);
    act(() => result.current.pushValue('3'));
    act(() => result.current.deleteValue('1'));
    act(() => result.current.setValue(['4']));
    expect(push).toHaveBeenCalled();
  });

  it('params v2 get/set', () => {
    const { result } = renderHook(() =>
      useQueryParamsV2<{ c?: string }>({ defaultValues: { c: 'z' } })
    );
    expect(result.current.values.c).toBe('z');
    act(() => result.current.setValues({ c: 'w' }));
    expect(push).toHaveBeenCalled();
  });
});
