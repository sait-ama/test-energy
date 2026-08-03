import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestsCollector } from './request-collect';

describe('requestsCollector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('collects values and calls callback after timeout', () => {
    const callback = vi.fn();
    const collect = requestsCollector<number>(callback);

    collect(1);
    collect(2);
    collect(3);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('resets collection after callback', () => {
    const callback = vi.fn();
    const collect = requestsCollector<number>(callback);

    collect(1);
    collect(2);
    vi.advanceTimersByTime(500);

    collect(3);
    collect(4);
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2]);
    expect(callback).toHaveBeenNthCalledWith(2, [3, 4]);
  });

  it('resets timeout on new values', () => {
    const callback = vi.fn();
    const collect = requestsCollector<number>(callback);

    collect(1);
    vi.advanceTimersByTime(400);
    collect(2);
    vi.advanceTimersByTime(400);
    collect(3);
    vi.advanceTimersByTime(400);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('works with different value types', () => {
    const callback = vi.fn();
    const collect = requestsCollector<string>(callback);

    collect('a');
    collect('b');
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith(['a', 'b']);
  });
});
