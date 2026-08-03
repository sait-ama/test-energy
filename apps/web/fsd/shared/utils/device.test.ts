import { describe, expect, it } from 'vitest';

import { getDevicePixelRatio, hasWindow } from './device';

describe('device utils', () => {
  it('hasWindow reflects window presence', () => {
    expect(hasWindow()).toBe(true);
  });

  it('getDevicePixelRatio returns window.devicePixelRatio or 1', () => {
    const original = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
    expect(getDevicePixelRatio()).toBe(2);
    Object.defineProperty(window, 'devicePixelRatio', { value: original, configurable: true });
  });
});
