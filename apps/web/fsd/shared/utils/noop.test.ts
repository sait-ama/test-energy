import { describe, expect, it } from 'vitest';

import { noop, noopArray, noopObject } from './noop';

describe('noop', () => {
  it('returns shared object when singleTone is true', () => {
    expect(noop(true)).toBe(noopObject);
  });

  it('returns new object when singleTone is false/undefined', () => {
    expect(noop()).not.toBe(noopObject);
  });

  it('exports noopArray', () => {
    expect(Array.isArray(noopArray)).toBe(true);
  });
});
