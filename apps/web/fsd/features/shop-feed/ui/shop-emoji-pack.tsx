import React from 'react';
import Image from 'next/image';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import {
  ShopItemAvailabilityDate,
  ShopItemCard,
  ShopItemTypeLabel,
} from '~entities/shop/ui/shop-item-card';
import { ShopItemImage } from '~entities/shop/ui/shop-item-image';
import { PurchaseActionShopItem } from '~features/shop-feed/ui/buy-button';
import { useShopFeedItemPreview } from '~features/shop-feed/ui/shop-feed-item-preview/model/context';
import type { EmojiPackSchema, ShopItemSchema } from '~shared/api/models/shop';
import { ShopItemTypes } from '~shared/api/models/shop';
import { UrlFormatter } from '~shared/utils/url-formatter';

type EmojiPack = Omit<ShopItemSchema, 'emoji_pack'> & {
  emoji_pack: EmojiPackSchema;
};

export const isEmojiPack = (shopItem: ShopItemSchema): shopItem is EmojiPack => {
  return !!shopItem?.emoji_pack;
};
export const ShopEmojiPack = ({ shopItem }: { shopItem: EmojiPack }) => {
  if (!isEmojiPack) return null;
  const { emoji_pack } = shopItem;
  const { emojis, cover, name, is_emoji } = emoji_pack;
  const setItem = useShopFeedItemPreview((v) => v.setItem);

  const grid = is_emoji
    ? 'grid-cols-4 md:grid-cols-7'
    : 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4';
  const des = { height: is_emoji ? 72 : 128, width: is_emoji ? 72 : 128 };

  return (
    <ShopItemCard
      fallbackDisplayName="Эмодзи"
      className="bg-background flex flex-col gap-2 border-0 border-none md:gap-4"
      shopItem={shopItem as ShopItemSchema}
    >
      <div className="flex w-full flex-col items-center gap-2 self-start bg-transparent p-0 md:flex-row md:items-stretch md:gap-4">
        <ShopItemImage
          imgClassName="aspect-square"
          containerClassName="w-auto"
          className="absolute aspect-square size-20 -translate-y-[146px] after:absolute after:bottom-[-2px] after:left-0 after:z-10 after:block after:h-[30%] after:w-full after:bg-gradient-to-b after:from-transparent after:to-[var(--r-linear-gradient-color)] after:content-[''] after:[--r-linear-gradient-color:hsl(var(--r-popover))] md:static md:translate-y-0"
          width={100}
          frameSrc={null}
          height={100}
          type={ShopItemTypes.PACK}
          alt={name}
          imgSrc={UrlFormatter.media(cover.high)}
          avatarSrc={null}
        />
        <span className="bg-card/30 border-border flex w-full flex-col items-center gap-2 self-center rounded-md border md:items-stretch md:self-end md:border-0 md:border-none md:bg-transparent">
          <ReText className="text-center md:text-left" weight="bold" size="lg">
            {name}
          </ReText>
          <ShopItemTypeLabel size="sm" />
        </span>
      </div>
      <ScrollArea>
        <div
          className={cn(
            grid,
            'border-border bg-card/60 grid h-full max-h-[40vh] flex-wrap justify-between gap-2 overflow-auto rounded-md border p-2 md:gap-6 md:p-6'
          )}
        >
          {emojis.map(({ id, image: { high } = {} }) =>
            high ? (
              <Image
                key={id}
                className="hover-card aspect-square cursor-pointer rounded-md"
                // quality={75}
                {...des}
                unoptimized
                alt={`эмодзи к ${name}`}
                src={UrlFormatter.media(high)}
              />
            ) : null
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <ShopItemAvailabilityDate setItem={setItem} />
      <PurchaseActionShopItem
        shopItem={shopItem}
        currency={shopItem.cost_tickets ? 'tickets' : 'coins'}
        className="self-center"
      />
    </ShopItemCard>
  );
};
