import { InfiniteData } from '@tanstack/query-core';

export const getInfiniteMutator = <T>(
  data: InfiniteData<{
    results: T[];
  }>
) => {
  return (mutator: (res: T) => Partial<T>, predicate: (res: T) => boolean) => {
    const pages: (typeof data)['pages'] = [];
    let pageIndex = 0;
    for (const page of data.pages) {
      for (const res of page.results) {
        if (pages?.[pageIndex]) {
          pages[pageIndex]?.results.push(predicate(res) ? { ...res, ...mutator(res) } : res);
        }
      }
      pageIndex++;
    }
    data.pages = pages;
    return { ...data, pages };
  };
};
