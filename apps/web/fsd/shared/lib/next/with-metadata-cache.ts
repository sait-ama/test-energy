import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';

import type { NextPageParams } from '~shared/types/next';

export const withMetadataCache = <
  Params extends Record<string, string | string[] | undefined> | null,
  SearchParams extends Record<string, string | string[] | undefined> | null | undefined = undefined,
>(
  generateMetadata: (params: NextPageParams<Params, SearchParams>) => Promise<Metadata>,
  identifier: string
) => {
  // TODO: tests
  return generateMetadata;

  return unstable_cache(generateMetadata, [identifier], {
    tags: ['metadata', identifier],
    revalidate: 60 * 60 * 24,
  });
};
