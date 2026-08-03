import { describe, expect, it } from 'vitest';

import { calculateSoSoArrayIndex4Slides, round } from './number';

describe('number utils', () => {
  describe('round', () => {
    it('rounds to 0 decimals by default', () => {
      expect(round(1.49)).toBe(1);
      expect(round(1.5)).toBe(2);
    });

    it('rounds to specified decimals', () => {
      expect(round(1.2345, 2)).toBe(1.23);
      expect(round(1.235, 2)).toBe(1.24);
    });
  });

  describe('calculateSoSoArrayIndex4Slides', () => {
    it('wraps positive indexes', () => {
      expect(calculateSoSoArrayIndex4Slides(5, 3)).toBe(2);
    });

    it('wraps negative indexes', () => {
      expect(calculateSoSoArrayIndex4Slides(-1, 3)).toBe(2);
    });

    it('returns 0 for non-positive array length', () => {
      expect(calculateSoSoArrayIndex4Slides(10, 0)).toBe(0);
    });
  });
});
