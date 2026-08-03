import { describe, expect, it } from 'vitest';

import { toArray } from './to-array';

describe('toArray', () => {
  it('wraps non-array into array', () => {
    expect(toArray(1)).toEqual([1]);
  });

  it('keeps arrays as is', () => {
    expect(toArray([1, 2])).toEqual([1, 2]);
  });
});
