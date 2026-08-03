import { randInt } from './rand-int';

describe('randInt', () => {
  test('returns number within range', () => {
    const result = randInt(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThan(10);
  });

  test('handles zero and negative numbers', () => {
    const result = randInt(-5, 0);
    expect(result).toBeGreaterThanOrEqual(-5);
    expect(result).toBeLessThan(0);
  });

  test('returns integer values', () => {
    const result = randInt(1, 100);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('handles same start and end', () => {
    const result = randInt(5, 5);
    expect(result).toBe(5);
  });
});
