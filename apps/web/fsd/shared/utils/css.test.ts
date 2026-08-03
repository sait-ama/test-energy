import { describe, expect, it } from 'vitest';

import { parseLengthPercentage } from './css';

describe('parseLengthPercentage', () => {
  it('parses numbers as pixels', () => {
    expect(parseLengthPercentage(10)).toEqual({ pixel: 10 });
  });

  it('parses string pixels', () => {
    expect(parseLengthPercentage('20px')).toEqual({ pixel: 20 });
  });

  it('parses percentages', () => {
    expect(parseLengthPercentage('33%')).toEqual({ percent: 33 });
  });
});
