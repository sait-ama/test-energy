import { describe, expect, it } from 'vitest';

import { parseJson } from './parse-json';

describe('parseJson', () => {
  it('parses valid JSON string', () => {
    const input = '{"name": "test", "value": 123}';
    const result = parseJson<{ name: string; value: number }>(input);
    expect(result).toEqual({ name: 'test', value: 123 });
  });

  it('returns default value for invalid JSON', () => {
    const input = 'invalid json';
    const defaultValue = true;
    const result = parseJson<boolean>(input, defaultValue);
    expect(result).toBe(defaultValue);
  });

  it('handles undefined default value', () => {
    const input = 'invalid json';
    const result = parseJson(input);
    expect(result).toBeUndefined();
  });

  it('parses arrays', () => {
    const input = '[1, 2, 3]';
    const result = parseJson<number[]>(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it('parses primitive values', () => {
    expect(parseJson<number>('123')).toBe(123);
    expect(parseJson<string>('"test"')).toBe('test');
    expect(parseJson<boolean>('true')).toBe(true);
  });
});
