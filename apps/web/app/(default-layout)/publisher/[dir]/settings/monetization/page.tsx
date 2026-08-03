import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { getConnectedCArdKey } from '~features/(publisher)/withdraw/model/queries';
import { PublisherSettingsPayments } from '~pages/(publisher)/(settings)/monetization/ui/publisher-payments-settings';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-monetization-edit-page.meta');

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
      }),
      index: false,
      follow: false,
    });
  }, 'publisher-monetization')
);

const MonetizationPage = async (props: NextPageParams<{ dir: string }>) => {
  const params = await props.params;
  const queryClient = getQueryClient();

  const publisher = await queryClient.fetchQuery(
    getPublisherQuery({ variables: { params: { dir: params.dir } } })
  );
  await queryClient.prefetchQuery(
    getConnectedCArdKey({ variables: { params: { id: publisher.content.id } } })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublisherSettingsPayments />
    </HydrationBoundary>
  );
};

export default MonetizationPage;

export const dynamic = 'force-dynamic';
