import { describe, expect, it } from 'vitest';

import { deduplicate } from './record-deduplicator';

describe('deduplicate', () => {
  it('removes items with duplicate keys preserving first occurrence', () => {
    const input = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
      { id: 3, name: 'd' },
      { id: 2, name: 'e' },
    ];

    const result = deduplicate(input, (i) => i.id);
    expect(result).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'd' },
    ]);
  });

  it('handles empty array', () => {
    const result = deduplicate([], (i) => (i as any)?.id);
    expect(result).toEqual([]);
  });
});
