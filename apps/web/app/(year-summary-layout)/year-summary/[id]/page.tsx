import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { UserRepository } from '~entities/user/model/repository';
import {
  getYearSummaryAllKey,
  getYearSummaryByUserKey,
} from '~entities/year-summary/model/queries';
import { YearSummaryPage } from '~pages/year-summary/ui/year-summary';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { UnloggedBoundary } from '~shared/lib/auth/unlogged-boundary';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const t = await getTranslations();
    const domainConfig = getSiteConfig()!;

    const { id } = await props.params;
    const user = await UserRepository.userById({ params: { userId: id } });

    const username = user.username;

    const title = t('yearSummary.meta.заголовок', { username: username });
    const description = title;

    return {
      title,
      description,
      keywords: t(`common.Ключевые слова`, { content: domainConfig.contentType }),
      openGraph: {
        title,
        description,
      },
    } satisfies Metadata;
  }, 'year-summary-detailed')
);

export default async function YearSummary({ params }: NextPageParams<{ id: string }>) {
  const queryClient = getQueryClient();
  const { id } = await params;

  const prefetches: Promise<void>[] = [
    queryClient.prefetchQuery(getYearSummaryAllKey({ variables: {} })),
    queryClient.prefetchQuery(
      getYearSummaryByUserKey({
        variables: {
          params: {
            userId: Number(id),
          },
        },
      })
    ),
    queryClient.prefetchQuery(getSuspenseUserQuery({ variables: { params: { userId: id } } })),
  ];

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnloggedBoundary>
        <YearSummaryPage />
      </UnloggedBoundary>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
