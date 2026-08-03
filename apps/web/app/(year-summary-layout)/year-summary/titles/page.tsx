import React from 'react';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getYearSummaryAllKey } from '~entities/year-summary/model/queries';
import { YearSummaryTitles } from '~pages/year-summary/ui/year-summary-titles';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations();
    const domainConfig = getSiteConfig()!;

    const title = t(`pages.home.meta.${domainConfig.contentType}.title`);

    const description = t(`pages.home.meta.${domainConfig.contentType}.description`, {
      siteName: domainConfig.site.name,
    });

    return generateNextMetadata({
      title,
      description,
    });
  }, 'year-summary-titles')
);

export default async function YearSummary() {
  const queryClient = getQueryClient();

  const prefetches: Promise<void>[] = [
    queryClient.prefetchQuery(getYearSummaryAllKey({ variables: {} })),
  ];

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <YearSummaryTitles />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
