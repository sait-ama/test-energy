import { describe, expect, it } from 'vitest';

import { valueIs } from './valueIs';

describe('is type guard', () => {
  it('returns true when exact is true', () => {
    const value: unknown = 1;
    if (valueIs<number>(value, true)) {
      expect(typeof value).toBe('number');
    }
  });

  it('returns false when exact is false', () => {
    const value: unknown = 1;
    expect(valueIs<number>(value, false)).toBe(false);
  });
});
