import { describe, expect, it } from 'vitest';

import { objectOptional } from './object-optional';

describe('objectOptional', () => {
  it('returns value when cond is true', () => {
    expect(objectOptional(true, { a: 1 })).toEqual({ a: 1 });
  });

  it('returns empty object when cond is false', () => {
    expect(objectOptional(false, { a: 1 })).toEqual({});
  });
});
