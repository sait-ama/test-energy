import { describe, expect, it } from 'vitest';

import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('returns empty string for falsy input', () => {
    expect(capitalize('')).toBe('');
  });

  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('keeps already-capitalized string', () => {
    expect(capitalize('World')).toBe('World');
  });
});
