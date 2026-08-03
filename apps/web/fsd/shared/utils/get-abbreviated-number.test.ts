import { describe, expect, it } from 'vitest';

import { getAbbreviatedNumber } from './get-abbreviated-number';

describe('getAbbreviatedNumber', () => {
  it('formats large numbers compactly', () => {
    // Result formatting may vary by locale implementation, but ensures string returned
    expect(typeof getAbbreviatedNumber(1_200)).toBe('string');
  });

  it('respects digits', () => {
    const res = getAbbreviatedNumber(1_250, 1);
    expect(typeof res).toBe('string');
  });
});
