import React from 'react';

import { removeUnusedQueryParams } from '@re/core/lib/query-params';

import { getItemCurrency } from '~entities/shop/model/utils';
import {
  ShopItemAuthor,
  ShopItemAvailabilityDate,
  ShopItemAvailabilityWithoutReasons,
  ShopItemCard,
  ShopItemTypeLabel,
} from '~entities/shop/ui/shop-item-card';
import { UserSnapshot } from '~entities/user/ui/user-snapshot';
import { useExcludeShopFragmentsStore } from '~features/shop-feed/model/store';
import { PurchaseActionShopItem } from '~features/shop-feed/ui/buy-button';
import { ShopImageItemType, ShopItemSchema } from '~shared/api/models/shop';
import { useSession } from '~shared/lib/session/use-session';

import { useShopFeedItemPreview } from './model/context';

export const ShopItemImageItemDetail = ({ shopItem }: { shopItem: ShopItemSchema }) => {
  const session = useSession() || {};
  const setItem = useShopFeedItemPreview((v) => v.setItem);
  const item = useShopFeedItemPreview((v) => v.item);
  const type = shopItem.image_item?.type;
  const image = shopItem.image_item?.image.high;
  const avatar = useExcludeShopFragmentsStore((v) => v.avatar);
  const frame = useExcludeShopFragmentsStore((v) => v.frame);
  const overrides = removeUnusedQueryParams(
    {
      ...(type === ShopImageItemType.WALLPAPER ? { wallpaper: { high: image } } : {}),
      ...(type === ShopImageItemType.AVATAR ? { avatar: { high: image } } : {}),
      ...(type === ShopImageItemType.FRAME ? { frame: { high: image } } : {}),
    },
    3
  );

  return (
    //todo i18n
    <ShopItemCard
      fallbackDisplayName="Элемент кастомизации"
      variant="default"
      className="relative -m-6 flex flex-col overflow-hidden border-0 border-none p-0"
      shopItem={shopItem || item}
    >
      <UserSnapshot
        model={{
          ...session,
          ...overrides,
          ...(!avatar ? { avatar: null } : {}),
          ...(!frame ? { frame: null } : {}),
        }}
      />
      <div className="flex flex-col items-center justify-between gap-2 p-4 pt-0 md:flex-row md:items-end">
        <div className="flex flex-col items-center gap-2 p-1 md:items-stretch">
          <div className="flex flex-wrap items-center gap-2">
            <ShopItemTypeLabel color="muted-foreground" size="lg" />
            <ShopItemAuthor prefix="от" />
          </div>
          <ShopItemAvailabilityDate setItem={setItem} className="hidden md:block" />
          <ShopItemAvailabilityWithoutReasons />
        </div>
        <PurchaseActionShopItem shopItem={shopItem} currency={getItemCurrency(shopItem)} />
        <ShopItemAvailabilityDate className="block text-center md:hidden" />
      </div>
    </ShopItemCard>
  );
};
