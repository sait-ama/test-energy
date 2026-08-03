type KeyExtractor<T> = (item: T) => NumberIsomorphic;

export const deduplicate = <T>(array: T[], keyExtractor: KeyExtractor<T>): T[] => {
  const seenKeys = new Set<NumberIsomorphic>();
  const result: T[] = [];

  for (const item of array) {
    const key = keyExtractor(item);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      result.push(item);
    }
  }

  return result;
};
