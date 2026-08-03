import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getHeroCardQuery } from '~entities/inventory/model/queries';
import { CardEditPage } from '~pages/card-edit/ui/card-edit-page';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async ({ params }) => {
    const { id } = await params;
    const t = await getTranslations('pages.hero-card-edit.meta');

    const queryClient = getQueryClient();

    const card = await queryClient.fetchQuery(
      getHeroCardQuery({
        variables: { params: { cardId: id } },
        fetchOptions: {
          cache: 'no-cache',
        },
      })
    );
    const config = getSiteConfig()!;

    const title = t('title', {
      character: card?.character?.name ?? '',
      title: card?.title?.main_name ?? '',
      rank: card.rank.slice(5).toUpperCase(),
    });

    const description = t('description', {
      character: card?.character?.name ?? '',
      title: card?.title?.main_name ?? '',
      rank: card.rank.slice(5).toUpperCase(),
      siteName: config.site.name,
    });

    return generateNextMetadata({
      title,
      description,
      index: false,
      follow: false,
    });
  }, 'card-edit')
);

export default async function CreateCard(
  props: NextPageParams<{ id: string }, { defaultValues: string }>
) {
  const params = await props.params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    getHeroCardQuery({ variables: { params: { cardId: params.id } } })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CardEditPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
