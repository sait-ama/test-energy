import { describe, expect, it } from 'vitest';

import { adjustArrayLength } from './adjust-array-length';

describe('adjustArrayLength', () => {
  describe('columns mode', () => {
    it('pads array to match column count', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = adjustArrayLength(arr, { columns: 3 });
      expect(result).toEqual([1, 2, 3, 4, 5, null]);
    });

    it('respects minRows', () => {
      const arr = [1, 2, 3];
      const result = adjustArrayLength(arr, { columns: 2, minRows: 3 });
      expect(result).toEqual([1, 2, 3, null, null, null]);
    });

    it('uses custom fillFunc', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = adjustArrayLength(arr, {
        columns: 3,
        fillFunc: (i) => `fill${i}`,
      });
      expect(result).toEqual([1, 2, 3, 4, 5, 'fill0']);
    });
  });

  describe('length mode', () => {
    it('extends array to specified length', () => {
      const arr = [1, 2];
      const result = adjustArrayLength(arr, { length: 4 });
      expect(result).toEqual([1, 2, null, null]);
    });

    it('cuts array when longer than specified length', () => {
      const arr = [1, 2, 3, 4];
      const result = adjustArrayLength(arr, { length: 2 });
      expect(result).toEqual([1, 2]);
    });

    it('respects cutOnOverflow=false', () => {
      const arr = [1, 2, 3, 4];
      const result = adjustArrayLength(arr, {
        length: 2,
        cutOnOverflow: false,
      });
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('uses custom fillFunc', () => {
      const arr = [1];
      const result = adjustArrayLength(arr, {
        length: 3,
        fillFunc: (i) => i + 10,
      });
      expect(result).toEqual([1, 10, 11]);
    });
  });

  it('handles empty array', () => {
    const result = adjustArrayLength([], { columns: 2, minRows: 2 });
    expect(result).toEqual([null, null, null, null]);
  });

  it('works with different types', () => {
    const arr = ['a', 'b'];
    const result = adjustArrayLength<string, string[]>(arr, {
      length: 4,
      fillFunc: (i) => `fill${i}`,
    });
    expect(result).toEqual(['a', 'b', 'fill0', 'fill1']);
  });
});
