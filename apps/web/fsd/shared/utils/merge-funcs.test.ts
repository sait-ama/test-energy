import { describe, expect, it, vi } from 'vitest';

import { mergeFunc } from './merge-funcs';

describe('merge-funcs', () => {
  it('calls functions in order', () => {
    const a = vi.fn();
    const b = vi.fn();
    const merged = mergeFunc(a, b)!;
    merged('x');
    expect(a).toHaveBeenCalledWith('x');
    expect(b).toHaveBeenCalledWith('x');
  });
});

describe('mergeFunc', () => {
  it('returns original function if only one provided', () => {
    const fn = vi.fn();
    const merged = mergeFunc(fn);
    expect(merged).toBe(fn);
  });

  it('calls all functions with same arguments', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const fn3 = vi.fn();

    const merged = mergeFunc(fn1, fn2, fn3)!;
    merged('test', 123);

    expect(fn1).toHaveBeenCalledWith('test', 123);
    expect(fn2).toHaveBeenCalledWith('test', 123);
    expect(fn3).toHaveBeenCalledWith('test', 123);
  });

  it('handles empty function array', () => {
    const merged = mergeFunc()!;
    expect(() => merged()).not.toThrow();
  });

  it('preserves execution order', () => {
    const order: number[] = [];
    const fn1 = () => order.push(1);
    const fn2 = () => order.push(2);
    const fn3 = () => order.push(3);

    const merged = mergeFunc(fn1, fn2, fn3)!;
    merged();

    expect(order).toEqual([1, 2, 3]);
  });
});
