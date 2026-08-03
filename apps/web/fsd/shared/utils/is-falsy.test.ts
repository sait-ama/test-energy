import { describe, expect, it } from 'vitest';

import { isTotalFalsy } from './is-total-falsy';

describe('isFalsy', () => {
  it('should return false for an empty object, use isEmpty instead', () => {
    expect(isTotalFalsy({}, {}, {})).toBe(false);
  });

  it('should return false for a non-empty object', () => {
    expect(isTotalFalsy({ key: 'value' })).toBe(false);
  });

  it('should return true when either parameter equals null or undefined', () => {
    expect(isTotalFalsy('', null)).toBe(false);
  });

  it('should return false for a non-empty string', () => {
    expect(isTotalFalsy('Hello', 'hello')).toBe(false);
  });

  it('should return true for undefined', () => {
    expect(isTotalFalsy(undefined)).toBe(true);
  });

  it('should return true for null', () => {
    expect(isTotalFalsy(null)).toBe(true);
  });

  it('should return true for an empty array', () => {
    expect(isTotalFalsy([])).toBe(true);
  });

  it('should return false for a non-empty array', () => {
    expect(isTotalFalsy([1, 2, 3])).toBe(false);
  });

  it('should return true for empty array', () => {
    expect(isTotalFalsy([])).toBe(true);
  });

  it('should return false for non-empty array', () => {
    expect(isTotalFalsy(['123', '1'])).toBe(false);
  });
});
