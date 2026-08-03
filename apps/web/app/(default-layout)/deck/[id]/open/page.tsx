import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getInventoryDecksInfiniteKey } from '~entities/inventory/model/queries';
import { getDeckById, getShopDecksPaginatedListQuery } from '~entities/shop/model/queries';
import { DeckOpenPage } from '~pages/deck-open/ui/deck-open-page';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id: deckId } = await props.params;
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const t = await getTranslations('pages.open-deck-page.meta');

    const deck = await queryClient.fetchQuery(
      getDeckById({ variables: { params: { deckId } }, fetchOptions: { cache: 'no-cache' } })
    );

    return generateNextMetadata({
      title: t('title', { name: deck.name }),
      description: t('description', {
        name: deck.name,
        cards: deck.cards?.length ?? 0,
        siteName: siteConfig.site.name,
      }),
      canonical: Routing.Deck.open({ params: { id: deckId } }),
    });
  }, 'deck-detailed')
);

export default async function CardListPage(props: NextPageParams<{ id: string }, never>) {
  const params = await props.params;
  const queryClient = getQueryClient();
  const session = await getSession();

  const deckId = params.id;

  const prefetches = [];

  if (session) {
    prefetches.push(
      queryClient.prefetchInfiniteQuery(
        getInventoryDecksInfiniteKey({
          variables: {
            params: { userId: session?.id },
            query: { deck_id: deckId, ordering: 'id' },
          },
        })
      )
    );
  }

  prefetches.push(
    queryClient.prefetchQuery(getDeckById({ variables: { params: { deckId } } })),
    queryClient.prefetchInfiniteQuery(
      getShopDecksPaginatedListQuery({ variables: { query: { deck_id: deckId } } })
    )
  );

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoSSR>
        <DeckOpenPage />
      </NoSSR>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
