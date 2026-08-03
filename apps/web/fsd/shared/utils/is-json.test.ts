import { describe, expect, it } from 'vitest';

import { isJson } from './is-json';

describe('isJson', () => {
  it('returns true for valid JSON string', () => {
    expect(isJson('{"a":1}')).toBe(true);
  });

  it('returns false for invalid JSON string', () => {
    expect(isJson('{')).toBe(false);
  });
});

describe('isJson', () => {
  it('returns true for valid JSON strings', () => {
    expect(isJson('{"name": "test"}')).toBe(true);
    expect(isJson('[1, 2, 3]')).toBe(true);
    expect(isJson('"string"')).toBe(true);
    expect(isJson('123')).toBe(true);
    expect(isJson('true')).toBe(true);
    expect(isJson('null')).toBe(true);
  });

  it('returns false for invalid JSON strings', () => {
    expect(isJson('{')).toBe(false);
    expect(isJson('invalid')).toBe(false);
    expect(isJson('undefined')).toBe(false);
    expect(isJson('{name: "test"}')).toBe(false);
  });

  it('returns false for non-string inputs', () => {
    expect(isJson(undefined)).toBe(false);
    expect(isJson(null)).toBe(false);
    expect(isJson(123)).toBe(false);
    expect(isJson({})).toBe(false);
    expect(isJson([])).toBe(false);
    expect(isJson(() => {})).toBe(false);
  });
});
