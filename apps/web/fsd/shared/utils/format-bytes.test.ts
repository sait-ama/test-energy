import { describe, expect, it } from 'vitest';

import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
  it('returns 0 Byte for 0', () => {
    expect(formatBytes(0)).toBe('0 Byte');
  });

  it('formats in normal mode by default', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats in accurate mode', () => {
    expect(formatBytes(1024, { sizeType: 'accurate' })).toBe('1 KiB');
  });

  it('respects decimals', () => {
    expect(formatBytes(1500, { decimals: 2 })).toBe('1.46 KB');
  });
});
