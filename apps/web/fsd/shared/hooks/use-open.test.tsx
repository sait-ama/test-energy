import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOpen } from './use-open';

describe('useOpen', () => {
  it('toggles and closes', () => {
    const { result } = renderHook(() => useOpen(false, true));
    const [, toggle, close] = result.current;
    act(() => toggle());
    expect(result.current[0]).toBe(true);
    act(() => close());
    expect(result.current[0]).toBe(false);
  });

  it('calls onFailOpen when cannot open', () => {
    const onFail = vi.fn();
    const { result } = renderHook(() => useOpen(false, false, onFail));
    const [, toggle] = result.current;
    act(() => toggle());
    expect(onFail).toHaveBeenCalled();
    expect(result.current[0]).toBe(false);
  });
});
