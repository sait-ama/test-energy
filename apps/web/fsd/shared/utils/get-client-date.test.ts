import { describe, expect, it } from 'vitest';

import { getClientDate, getServerDataWithTz } from './get-client-date';

describe('get-client-date', () => {
  it('appends +03:00 when timezone is missing', () => {
    const d = getClientDate({ serverDateString: '2020-01-01T00:00:00' });
    // With +03:00 timezone, 2020-01-01T00:00:00+03:00 becomes 2019-12-31T21:00:00.000Z in UTC
    expect(d?.toISOString()).toBe('2019-12-31T21:00:00.000Z');
  });

  it('keeps timezone when present', () => {
    const d = getClientDate({ serverDateString: '2020-01-01T00:00:00Z' });
    expect(d?.toISOString()).toBe('2020-01-01T00:00:00.000Z');
  });

  it('getServerDataWithTz appends tz if missing', () => {
    expect(getServerDataWithTz('2020-01-01T00:00:00')).toBe('2020-01-01T00:00:00+03:00');
    expect(getServerDataWithTz('2020-01-01T00:00:00Z')).toBe('2020-01-01T00:00:00Z');
  });
});
