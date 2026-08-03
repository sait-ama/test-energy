import { describe, expect, it } from 'vitest';

import { base64ToFile } from './base64-to-file';

describe('base64ToFile', () => {
  it('creates File from base64 data url', () => {
    const base64 = 'data:text/plain;base64,aGVsbG8='; // 'hello'
    const file = base64ToFile(base64, 'hello.txt', 'text/plain');
    expect(file.name).toBe('hello.txt');
    expect(file.type).toBe('text/plain');
  });

  it('throws on invalid base64 string', () => {
    expect(() => base64ToFile('invalid', 'x.txt', 'text/plain')).toThrow('Invalid base64 string');
  });
});
