import { describe, expect, it, vi } from 'vitest';

import { exhaustiveCheck } from './exhaustive-check';

vi.mock('~shared/utils/env', () => ({
  publicEnv: (key: string) => (key === 'NODE_ENV' ? 'development' : undefined),
}));

describe('exhaustiveCheck', () => {
  it('throws in development', () => {
    expect(() => exhaustiveCheck(undefined as never)).toThrowError('exhaustive check');
  });
});
