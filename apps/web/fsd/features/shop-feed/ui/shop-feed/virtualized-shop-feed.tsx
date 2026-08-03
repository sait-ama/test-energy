import { ReactNode } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';

import type { ShopItemSchema, ShopItemTypes } from '~shared/api/models/shop';

import { ItemWrapper, ListWrapper } from './shop-feed-components';

type ShopFeedProps = {
  shopItems: ShopItemSchema[];
  endReached?: () => Promise<void>;
  renderItem: (index: number, item: ShopItemSchema) => ReactNode;
};

export const VirtualizedShopFeed = ({ shopItems, endReached, renderItem }: ShopFeedProps) => {
  return (
    <VirtuosoGrid<ShopItemSchema, { type: ShopItemTypes }>
      endReached={endReached}
      initialItemCount={shopItems.length > 10 ? 10 : shopItems.length}
      useWindowScroll
      data={shopItems}
      increaseViewportBy={200}
      overscan={3}
      totalCount={shopItems.length}
      itemContent={renderItem}
      components={{
        List: ListWrapper,
        Item: ItemWrapper,
      }}
    />
  );
};
