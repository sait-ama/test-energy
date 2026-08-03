import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  it('uncontrolled uses defaultProp and onChange when value changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<number>({ defaultProp: 1, onChange }));
    const [, setValue] = result.current;
    act(() => setValue(2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('controlled calls onChange instead of state update', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ v }) => useControllableState<number>({ prop: v, onChange }),
      {
        initialProps: { v: 1 },
      }
    );
    act(() => result.current[1](2));
    expect(onChange).toHaveBeenCalledWith(2);
    rerender({ v: 2 });
    expect(result.current[0]).toBe(2);
  });
});
