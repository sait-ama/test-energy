import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { getTitlesByQueryInfiniteKey } from '~entities/title/model/queries';
import { getUserBookmarksTypesKey } from '~entities/user/model/queries';
import { getTransformedValues } from '~features/title-filters/model/lib';
import { PublisherDetailBreadcrumbsLd } from '~pages/(publisher)/seo/ld';
import { PublisherTitles } from '~pages/(publisher)/titles/ui/publisher-titles';
import { FormsTypes } from '~shared/api/models/forms';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-titles-page.meta');

    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const { content: publisher } = await queryClient.fetchQuery(
      getPublisherQuery({
        variables: { params: { dir } },
        fetchOptions: { cache: 'force-cache', next: { revalidate: 60 * 60 } },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: publisher.name, id: publisher.id, typeId: publisher.type.id }),
      description: t('description', {
        siteName: siteConfig.site.name,
        name: publisher.name,
        id: publisher.id,
        typeId: publisher.type.id,
        titles: publisher.count_titles,
      }),
      canonical: Routing.Publisher.detail({ params: { dir, tab: 'titles' } }),
    });
  }, 'publisher-titles')
);

export default async function PublisherTitlesPage(props: {
  params: Promise<{ dir: string }>;
  searchParams: Promise<string>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const queryClient = getQueryClient();
  const session = await getSession();
  const logged = !!session;
  const data = await queryClient.fetchQuery(
    getPublisherQuery({
      variables: { params: { dir: params.dir } },
    })
  );
  const publisher = data.content;

  const query = {
    publishers: [String(publisher.id)],
    ...getTransformedValues(searchParams),
  };

  const prefetches: Promise<void>[] = [
    queryClient.prefetchQuery(
      getTypesBaseKey({
        get: ['status', 'categories', 'genres', 'types', 'age_limit', 'translate_status'],
        type: FormsTypes.TITLES,
      })
    ),
    queryClient.prefetchInfiniteQuery(getTitlesByQueryInfiniteKey({ variables: { query } })),
  ];

  if (logged) {
    prefetches.push(
      queryClient.prefetchQuery(
        getUserBookmarksTypesKey({ variables: { params: { userId: session.id } } })
      )
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublisherDetailBreadcrumbsLd tab="titles" />
      <PublisherTitles />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
