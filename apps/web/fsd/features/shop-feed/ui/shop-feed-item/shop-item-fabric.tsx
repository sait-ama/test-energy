'use client';
import React, { ComponentProps, useCallback } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { shopLocalMutation } from '~entities/shop/model/mutations';
import {
  ShopFeedItemTime,
  ShopFeedItemTimerDepsProvider,
  ShopFeedTimerDepsStore,
} from '~entities/shop/ui/dates';
import {
  ShopItemCard,
  ShopItemCardContent,
  ShopItemCardImage,
  ShopItemConsumer,
  ShopItemCost,
  ShopItemCount,
  ShopItemFooter,
} from '~entities/shop/ui/shop-item-card';
import { useExcludeShopFragmentsStore } from '~features/shop-feed/model/store';
import { ShopItemSchema, ShopItemTypes } from '~shared/api/models/shop';
import { useSession } from '~shared/lib/session/use-session';

interface ShopFeedItemProps extends ComponentProps<'div'> {
  shopItem: ShopItemSchema;
}
export const ShopFeedItem = ({ shopItem, className, ...other }: ShopFeedItemProps) => {
  const avatar = useSession((v) => v?.avatar?.high) || null;
  const frame = useSession((v) => v?.frame?.high) || null;

  const withAvatar = useExcludeShopFragmentsStore((v) => v.avatar);
  const withFrame = useExcludeShopFragmentsStore((v) => v.frame);
  const onCompleteTimer = useCallback(
    (shopItemId: number, type: ShopItemTypes | null): ShopFeedTimerDepsStore['onCompleteTimer'] =>
      async (dateField) =>
        await shopLocalMutation({
          shopItemId,
          type,
          mutateFn: () => {
            if (dateField)
              return {
                [dateField === 'startDate' ? 'availability_start_date' : 'availability_end_date']:
                  null,
              };
            return {};
          },
        }),
    []
  );
  return (
    <ShopItemCard
      {...other}
      className={cn('bg-secondary relative size-full', className)}
      withHover
      shopItem={shopItem}
    >
      <ShopItemCardContent className="relative overflow-hidden">
        <ShopItemCardImage
          children={
            <ShopItemConsumer>
              {({
                model: { availability_end_date, availability_start_date, id },
                computed: { type },
              }) => (
                <ShopFeedItemTimerDepsProvider
                  key={id}
                  value={{ onCompleteTimer: onCompleteTimer(id, type) }}
                >
                  <ShopFeedItemTime
                    type={type}
                    shopItemId={id}
                    startDate={availability_start_date}
                    endDate={availability_end_date}
                    aria-label="временные ограничения"
                    className={cn(
                      'user-events-none bg-secondary/30 absolute bottom-0 left-0 z-[20]',
                      { 'bottom-7 left-1': type === ShopItemTypes.THEME }
                    )}
                  />
                </ShopFeedItemTimerDepsProvider>
              )}
            </ShopItemConsumer>
          }
          withAvatarFallback={withAvatar}
          preview
          className="max-w-[150px] group-hover:scale-105"
          avatarSrc={withAvatar ? avatar : null}
          frameSrc={withFrame ? frame : null}
        />
      </ShopItemCardContent>
      <ShopItemFooter>
        <span className="flex items-center gap-2">
          <ShopItemCount className="mb-1" />
        </span>
        <ShopItemCost />
      </ShopItemFooter>
    </ShopItemCard>
  );
};
//
