import { describe, expect, it } from 'vitest';

import { NArray, NOrder } from './NArray';

describe('NArray', () => {
  it('should create an empty NArray', () => {
    const arr = NArray.empty<number>();
    expect(arr.isEmpty()).toBe(true);
    expect(arr.length).toBe(0);
  });

  it('should create an NArray from an array', () => {
    const arr = NArray.new(1, 2, 3);
    expect(arr.length).toBe(3);
    expect(arr.first()).toBe(1);
  });

  it('should return the first element', () => {
    const arr = NArray.new(1, 2, 3);
    expect(arr.first()).toBe(1);
  });

  it('should check if the array is empty', () => {
    const arr = NArray.empty<number>();
    expect(arr.isEmpty()).toBe(true);

    const arr2 = NArray.new(1, 2, 3);
    expect(arr2.isEmpty()).toBe(false);
  });

  it('should find the index of a field', () => {
    const arr = NArray.new({ id: 1 }, { id: 2 }, { id: 3 });
    expect(arr.indexOfField('id', 2)).toBe(1);
    expect(arr.indexOfField('id', 4)).toBe(-1);
  });

  it('should find the max and min values', () => {
    const arr = NArray.new(1, 2, 3, 4, 5);
    expect(arr.maxBy((x) => x)).toBe(5);
    expect(arr.minBy((x) => x)).toBe(1);
  });

  it('should group by a key', () => {
    const arr = NArray.new(
      { category: 'fruit', name: 'apple' },
      { category: 'fruit', name: 'banana' },
      { category: 'vegetable', name: 'carrot' }
    );
    const grouped = arr.groupBy((item) => item.category);

    expect(grouped.fruit!.length).toBe(2);
    expect(grouped.vegetable!.length).toBe(1);
  });

  it('should order by a key', () => {
    const arr = NArray.new({ id: 3, name: 'C' }, { id: 1, name: 'A' }, { id: 2, name: 'B' });
    const ordered = arr.orderBy((item) => item.id, NOrder.ASC);
    expect(ordered.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('should remove duplicates by a key', () => {
    const arr = NArray.new({ id: 1, name: 'A' }, { id: 1, name: 'A' }, { id: 2, name: 'B' });
    const unique = arr.uniqBy((item) => item.id);
    expect(unique.length).toBe(2);
  });
});
