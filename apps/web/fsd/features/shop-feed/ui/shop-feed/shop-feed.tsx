'use client';

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { useShopPaginatedListSuspenseQuery } from '~entities/shop/model/queries';
import { ShopFeedItem } from '~features/shop-feed/ui/shop-feed-item';
import { ShopFeedItemPreviewViewAsync } from '~features/shop-feed/ui/shop-feed-item-preview/shop-feed-item-preview-view.async';
import type { ShopItemTypes, ShopPaginatedListOrderings } from '~shared/api/models/shop';
import { NArray } from '~shared/utils/NArray';

import {
  ShopCardItemPreviewTrigger,
  ShopFeedItemPreviewProvider,
} from './../shop-feed-item-preview/model/context';
import { VirtualizedShopFeed } from './virtualized-shop-feed';

export const ShopFeed = () => {
  const params = useParams<{ type: ShopItemTypes }>();
  const searchParams = useSearchParams();
  const ordering = searchParams.get('ordering') as ShopPaginatedListOrderings;

  const {
    fetchNextPage,
    isFetching,
    hasNextPage,
    data: { pages = [] } = {},
    isFetchingNextPage,
  } = useShopPaginatedListSuspenseQuery({
    variables: { query: { type: params.type, ordering: ordering ?? 'cost' } },
  });

  const shopItems = useMemo(
    () => NArray.newBy(pages.flatMap((page) => page.results)).uniqBy((v) => v.id),
    [pages]
  );

  const onReachEnd = async () => {
    if (hasNextPage && !isFetching && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  // shopItems[0].availability_start_date = null;
  // shopItems[0].availability_end_date = '2026-10-30T16:25:30+03:00';
  // shopItems[1].availability_start_date = '2026-10-30T16:25:30+03:00';
  // shopItems[1].availability_end_date = null;
  // shopItems[1].is_bought = false;
  return (
    <ShopFeedItemPreviewProvider key="shop-item-preview">
      <VirtualizedShopFeed
        shopItems={shopItems}
        renderItem={(_, data) => {
          return (
            <ShopCardItemPreviewTrigger model={data} key={data.id}>
              <ShopFeedItem shopItem={data} key={data.id} />
            </ShopCardItemPreviewTrigger>
          );
        }}
        endReached={onReachEnd}
      />
      <ShopFeedItemPreviewViewAsync />
    </ShopFeedItemPreviewProvider>
  );
};
