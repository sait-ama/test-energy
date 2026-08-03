import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMap } from './use-map';

describe('useMap', () => {
  it('sets and removes values', () => {
    const { result } = renderHook(() => useMap<string, number>());
    const [, actions] = result.current;
    act(() => actions.set('a', 1));
    expect(result.current[0].get('a')).toBe(1);
    act(() => actions.setAll([['b', 2]]));
    expect(result.current[0].get('b')).toBe(2);
    act(() => actions.remove('b'));
    expect(result.current[0].has('b')).toBe(false);
    act(() => actions.reset());
    expect(result.current[0].size).toBe(0);
  });
});
