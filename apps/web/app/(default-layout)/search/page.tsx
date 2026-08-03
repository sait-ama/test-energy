import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getSearchKey } from '~features/search/model/queries';
import { SearchPage } from '~pages/search/ui/Search';
import { SearchField } from '~shared/api/models/search';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(
    async (props: {
      searchParams: Promise<{ query: string; field: SearchField; page: string }>;
    }) => {
      const { query, field } = await props.searchParams;
      const siteConfig = getSiteConfig()!;

      const t = await getTranslations(`search-page.meta.${siteConfig.contentType}`);

      return generateNextMetadata({
        title: t('title'),
        description: t('description', { siteName: siteConfig.site.name }),
        canonical: Routing.Search.search({ query: { query, field } }),
      });
    },
    'search'
  )
);

export default async function Search(props: {
  searchParams: Promise<{ query: string; field: SearchField; page: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = new URLSearchParams(searchParams);
  const queryClient = getQueryClient();

  const query = search.get('query') ?? '';
  const page = parseInt(search.get('page') ?? '1', 24);
  const field = (search.get('field') ?? SearchField.titles) as SearchField;

  await queryClient.prefetchInfiniteQuery(
    getSearchKey({
      variables: {
        query: {
          query,
          field,
          count: 30,
          page,
        },
      },
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
