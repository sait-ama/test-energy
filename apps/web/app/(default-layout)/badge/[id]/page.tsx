import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getBadgeByIdKey } from '~entities/user/model/queries';
import { BadgeDetailPage } from '~pages/badge/ui/badge-detail-page';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('site-badge.meta');
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const badge = await queryClient.fetchQuery(
      getBadgeByIdKey({ variables: { params: { badgeId: id } } })
    );

    return generateNextMetadata({
      title: t('title', { name: badge.name }),
      description: t('description', { name: badge.name, siteName: siteConfig.site.name }),
      canonical: Routing.Badge.detail({ params: { id } }),
    });
  }, 'badge-detail')
);

export default async function NextBadgeDetailPage({ params }: NextPageParams<{ id: string }>) {
  const { id } = await params;
  const queryClient = getQueryClient();

  const [badge] = await Promise.all([
    queryClient.fetchQuery(getBadgeByIdKey({ variables: { params: { badgeId: id } } })),
  ]);

  if (!badge) {
    notFound();
  }

  return (
    <Container slim className="mt-4 flex flex-col gap-4 px-2">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <BadgeDetailPage />
        </Suspense>
      </HydrationBoundary>
    </Container>
  );
}
