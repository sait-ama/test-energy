import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSet } from './use-set';

describe('useSet', () => {
  it('adds, removes, toggles and clears', () => {
    const { result } = renderHook(() => useSet<number>(new Set([1])));
    const [, actions] = result.current;
    act(() => actions.add(2));
    expect(result.current[0].has(2)).toBe(true);
    act(() => actions.toggle(2));
    expect(result.current[0].has(2)).toBe(false);
    act(() => actions.clear());
    expect(result.current[0].size).toBe(0);
    act(() => actions.reset());
    expect(result.current[0].size).toBe(1); // Reset goes back to initial set [1]
  });
});
