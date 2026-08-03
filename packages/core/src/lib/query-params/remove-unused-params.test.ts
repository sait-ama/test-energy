import { describe, expect, test } from 'vitest';

import { removeUnusedQueryParams } from './remove-unused-params';

describe('removeUnusedQueryParams', () => {
  test('removes undefined values', () => {
    const input = { a: 1, b: undefined, c: 'test' };
    expect(removeUnusedQueryParams(input)).toEqual({ a: 1, c: 'test' });
  });

  test('handles nested objects', () => {
    const input = {
      a: { b: undefined, c: 1 },
      d: undefined,
    };
    expect(removeUnusedQueryParams(input)).toEqual({
      a: { c: 1 },
    });
  });

  test('respects depth limit', () => {
    const input = {
      a: {
        b: { c: undefined, d: 1 },
      },
    };
    expect(removeUnusedQueryParams(input, 1)).toEqual({
      a: {
        b: { c: undefined, d: 1 },
      },
    });
  });

  test('preserves arrays', () => {
    const input = { arr: [1, 2], empty: [] };
    expect(removeUnusedQueryParams(input)).toEqual(input);
  });

  test('keeps falsy values', () => {
    const input = { a: 0, b: '', c: false, d: null };
    expect(removeUnusedQueryParams(input)).toEqual(input);
  });
});
