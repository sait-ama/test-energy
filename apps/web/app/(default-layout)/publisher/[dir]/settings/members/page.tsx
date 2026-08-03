import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getPublisherQuery, getRightsKey } from '~entities/publisher/model/queries';
import { PublisherMemberSettings } from '~pages/(publisher)/(settings)/publisher-member-settings';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { v2PublishersMembersListOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { client } from '~shared/api/client';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-members-edit-page.meta');

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
  }, 'publisher-members')
);

const MembersSettings = async (props: NextPageParams<{ dir: string }>) => {
  const params = await props.params;

  const { dir } = params;

  const queryClient = getQueryClient();
  await Promise.all([
    // @ts-ignore
    queryClient.prefetchQuery(getRightsKey()),
    queryClient.prefetchQuery(v2PublishersMembersListOptions({ client, path: { dir } })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublisherMemberSettings />
    </HydrationBoundary>
  );
};

export default MembersSettings;

export const dynamic = 'force-dynamic';
