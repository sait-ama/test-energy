import { getTranslations } from 'next-intl/server';

import { getHeroCardsByUserInfiniteQuery } from '~entities/inventory/model/queries';
import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { InventoryTabsProvider } from '~pages/(user)/inventory-tab/hooks/use-inventory-tabs';
import { InventoryTab } from '~pages/(user)/inventory-tab/inventory-tab';
import { UserDetailBreadcrumbsLd } from '~pages/(user)/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('pages.user-inventory.meta');

    const queryClient = getQueryClient();

    const userPrefetch = await queryClient.fetchQuery(
      getSuspenseUserQuery({
        variables: { params: { userId: id } },
        fetchOptions: { cache: 'no-cache' },
      })
    );

    const cardsPrefetch = queryClient
      .fetchInfiniteQuery(
        getHeroCardsByUserInfiniteQuery({
          variables: {
            params: {
              userId: Number(id),
            },
            query: {
              page: 1,
              count: 5,
            },
          },
          fetchOptions: { cache: 'no-cache' },
        })
      )
      .then((v) => v.pages.flatMap((it) => it.results));

    const [user, cards] = await Promise.all([userPrefetch, cardsPrefetch]);

    const username = user.username;

    return generateNextMetadata({
      title: t('title', { username }),
      description: t('description', {
        username,
        cards: cards.map((it) => it.card.character?.name || 'коллекционная карточка').join(', '),
      }),
      canonical: Routing.User.detail({ params: { id, tab: 'inventory' } }),
    });
  }, 'user-inventory')
);

export default async function InventoryPage({ params }: NextPageParams<{ id: string }>) {
  const { id } = await params;

  return (
    <>
      <UserDetailBreadcrumbsLd tab="inventory" />
      <InventoryTabsProvider value={+id}>
        <InventoryTab />
      </InventoryTabsProvider>
    </>
  );
}

export const dynamic = 'force-dynamic';
