import { describe, expect, it, vi } from 'vitest';

import { shuffleArray } from './shuffle';

describe('shuffleArray', () => {
  it('returns array with same elements in possibly different order', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const input = [1, 2, 3, 4];
    const result = shuffleArray([...input]);
    expect(result.sort()).toEqual(input.sort());
    (Math.random as any).mockRestore();
  });
});
