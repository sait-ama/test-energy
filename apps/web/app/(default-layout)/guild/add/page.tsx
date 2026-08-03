import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getClubsInfiniteListOptions } from '~entities/guild/api/queries';
import { client } from '~shared/api/client';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { AddClubForm } from '~widgets/add-guild-form/ui/add-guild-form';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.guild.add.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'guild-add')
);

export default async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery(
    getClubsInfiniteListOptions({
      client,
      query: { count: 20, page: 1 },
    })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AddClubForm />
    </HydrationBoundary>
  );
};

export const dynamic = 'force-dynamic';
