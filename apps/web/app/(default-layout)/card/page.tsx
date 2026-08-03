import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getCardFormsKey, getHeroCardCatalog } from '~entities/inventory/model/queries';
import { getTransformedValues } from '~pages/card/model/mapper';
import { CardCatalog } from '~pages/card/ui/card-list';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.hero-card-catalog.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      canonical: Routing.Card.catalog({ query: {} }),
    });
  }, 'cards-list')
);

export default async function CardListPage(props: NextPageParams<null, void>) {
  const searchParams = await props.searchParams;
  const queryClient = getQueryClient();

  const query = getTransformedValues(searchParams);

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      getHeroCardCatalog({
        variables: {
          query,
        },
      })
    ),
    queryClient.prefetchQuery(getCardFormsKey()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CardCatalog />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
