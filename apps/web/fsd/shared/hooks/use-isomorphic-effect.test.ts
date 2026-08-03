import { describe, expect, it } from 'vitest';

import { useIsomorphicEffect } from './use-isomorphic-effect';

describe('useIsomorphicEffect', () => {
  it('exports a function', () => {
    expect(typeof useIsomorphicEffect).toBe('function');
  });
});
