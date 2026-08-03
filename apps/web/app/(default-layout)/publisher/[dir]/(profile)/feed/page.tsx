import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getLatestChaptersListSuspenseInfiniteQuery } from '~entities/latest-chapter/model/queries';
import { getPublisherQuery } from '~entities/publisher/model/queries';
import { PublisherRepository } from '~entities/publisher/model/repository';
import { PublisherFeed } from '~pages/(publisher)/feed/ui/publisher-feed';
import { PublisherDetailBreadcrumbsLd } from '~pages/(publisher)/seo/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-feed-page.meta');

    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const { content: publisher } = await queryClient.fetchQuery(
      getPublisherQuery({
        variables: { params: { dir } },
        fetchOptions: { cache: 'no-cache' },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: publisher.name, id: publisher.id, typeId: publisher.type.id }),
      description: t('description', {
        siteName: siteConfig.site.name,
        name: publisher.name,

        typeId: publisher.type.id,
      }),
      canonical: Routing.Publisher.detail({ params: { dir, tab: 'feed' } }),
    });
  }, 'publisher-feed')
);

export default async function PublisherFeedPage(props: NextPageParams<{ dir: string }>) {
  const params = await props.params;
  const queryClient = getQueryClient();
  const data = await PublisherRepository.getPublisherByDir({ params });

  const publisher = data.content;

  await queryClient.prefetchInfiniteQuery(
    getLatestChaptersListSuspenseInfiniteQuery({
      variables: {
        query: {
          publisher: publisher.id,
          only_reading: 0,
        },
      },
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublisherDetailBreadcrumbsLd tab="feed" />
      <PublisherFeed />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
