import { describe, expect, it } from 'vitest';

import { easeInOutCirc, easeInOutCubic, easeInOutSine } from './easings';

describe('easings', () => {
  it('easeInOutCubic returns expected values at edges and middle', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('easeInOutCirc returns expected values at edges and middle', () => {
    expect(easeInOutCirc(0)).toBeCloseTo(0, 5);
    expect(easeInOutCirc(0.5)).toBeCloseTo(0.5, 2);
    expect(easeInOutCirc(1)).toBeCloseTo(1, 5);
  });

  it('easeInOutSine returns expected values at edges and middle', () => {
    expect(easeInOutSine(0)).toBe(0);
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 5);
    expect(easeInOutSine(1)).toBe(1);
  });
});
