import { describe, expect, it } from 'vitest';

import { arrayOptional } from './array-optional';

describe('arrayOptional', () => {
  it('returns array with value when cond is true', () => {
    expect(arrayOptional(true, 1)).toEqual([1]);
  });

  it('returns empty array when cond is false', () => {
    expect(arrayOptional(false, 1)).toEqual([]);
  });
});
