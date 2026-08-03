import React from 'react';
import Link from 'next/link';

import { buttonVariants } from '@re/ui-kit/ui/button';
import { MediaContent, MediaFallback, MediaRoot } from '@re/ui-kit/ui/media';

import { getItemCurrency } from '~entities/shop/model/utils';
import {
  ShopItemAuthor,
  ShopItemAvailabilityDate,
  ShopItemCard,
  ShopItemTypeLabel,
} from '~entities/shop/ui/shop-item-card';
import { PurchaseActionShopItem } from '~features/shop-feed/ui/buy-button';
import { useShopFeedItemPreview } from '~features/shop-feed/ui/shop-feed-item-preview/model/context';
import { ShopItemSchema } from '~shared/api/models/shop';
import { Routing } from '~shared/config/routing';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { useSession } from '~shared/lib/session/use-session';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const ShopItemThemeDetail = ({ shopItem }: { shopItem: ShopItemSchema }) => {
  const themeImage = shopItem.theme?.cover.high;
  const session = useSession();
  const setItem = useShopFeedItemPreview((v) => v.setItem);
  //todo i18n
  return (
    <ShopItemCard
      fallbackDisplayName="Тема профиля"
      variant="default"
      className="relative -m-6 flex flex-col overflow-hidden border-0 border-none p-0"
      shopItem={shopItem}
    >
      <MediaRoot
        className="relative aspect-[1.42] h-auto w-full"
        src={UrlFormatter.media(themeImage)}
      >
        <MediaContent
          alt={shopItem.theme?.name || ''}
          className="absolute -top-[20%] aspect-square w-full md:top-[-100px]"
        />
        <MediaFallback />
      </MediaRoot>
      <div className="flex flex-col justify-between gap-2 p-6 md:flex-row md:items-end">
        <div className="flex flex-col items-center gap-2 p-1 md:items-stretch">
          <div className="flex flex-wrap items-center gap-2">
            <ShopItemTypeLabel color="muted-foreground" size="lg" />
            <ShopItemAuthor prefix="от" />
          </div>
          <Media greaterThanOrEqual={Display.md}>
            <ShopItemAvailabilityDate setItem={setItem} className="hidden md:block" />
          </Media>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          {session && !!shopItem.theme && (
            <Link
              href={Routing.User.detail({
                params: {
                  id: session.id,
                },
                query: {
                  themePreview: shopItem.dir,
                },
              })}
              className={buttonVariants({ variant: 'secondary' })}
            >
              Предпросмотр
            </Link>
          )}
          <PurchaseActionShopItem shopItem={shopItem} currency={getItemCurrency(shopItem)} />
        </div>
        <Media lessThan={Display.md}>
          <ShopItemAvailabilityDate setItem={setItem} className="block text-center md:hidden" />
        </Media>
      </div>
    </ShopItemCard>
  );
};
