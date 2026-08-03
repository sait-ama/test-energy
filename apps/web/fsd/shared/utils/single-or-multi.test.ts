import { describe, expect, it } from 'vitest';

import { SingleOrMulti } from './single-or-multi';

describe('SingleOrMulti', () => {
  it('identifies single vs multi', () => {
    expect(new SingleOrMulti(1).isSingle).toBe(true);
    expect(new SingleOrMulti([1, 2]).isSingle).toBe(false);
  });

  it('transform applies to single', () => {
    const res = new SingleOrMulti(2).transform((x) => x * 2);
    expect(res.toArray()).toEqual([4]);
  });

  it('transform applies to multi', () => {
    const res = new SingleOrMulti([1, 2]).transform((x) => x + 1);
    expect(res.toArray()).toEqual([2, 3]);
  });

  it('transform respects onlyIf', () => {
    const single = new SingleOrMulti(1).transform((x) => x + 1, 'multi');
    expect(single.toArray()).toEqual([1]);

    const multi = new SingleOrMulti([1]).transform((x) => x + 1, 'single');
    expect(multi.toArray()).toEqual([1]);
  });

  it('filter works for single and multi', () => {
    const singleKept = new SingleOrMulti(2).filter((x) => x > 1);
    expect(singleKept.toArray()).toEqual([2]);

    const singleDropped = new SingleOrMulti(0).filter((x) => x > 1);
    expect(singleDropped.toArray()).toEqual([null]);

    const multi = new SingleOrMulti([1, 2, 3]).filter((x) => x > 1);
    expect(multi.toArray()).toEqual([2, 3]);
  });

  it('isEmpty works for single and multi', () => {
    expect(new SingleOrMulti(0).isEmpty()).toBe(true);
    expect(new SingleOrMulti(1).isEmpty()).toBe(false);
    expect(new SingleOrMulti([]).isEmpty()).toBe(true);
    expect(new SingleOrMulti([1]).isEmpty()).toBe(false);
  });
});
