'use client';

import { FC, memo } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { SimpleUserCard } from '~entities/inventory/ui/simple-user-card';
import type {
  UnifiedInventoryItemSchema,
  UnifiedInventoryItemTypeSchema,
} from '~shared/api/models/inventory';
import type { UserSchemaFragment } from '~shared/api/models/user';
import { Carousel, CarouselContent, CarouselItem } from '~shared/ui/carousel';

import { UnifiedItemModalTrigger, UnifiedItemView } from '../item/unified-item-view';

export interface ExchangeCardProps {
  items: ({
    model: UnifiedInventoryItemSchema;
    type: UnifiedInventoryItemTypeSchema;
  } | null)[];
  user?: UserSchemaFragment | null | undefined;
  isCurrentUser?: boolean;
  label: string;
  basisClassName?: string;
  loading?: boolean;
}

export const ExchangeCard: FC<ExchangeCardProps> = memo(
  ({ loading, items, user, isCurrentUser, label, basisClassName = 'basis-1/4' }) => {
    return (
      <div className="flex flex-col gap-2">
        <SimpleUserCard
          user={user}
          title={`${isCurrentUser ? `Ваши карточки` : `Карточки ${user?.username}`} (${items.filter(Boolean).length}):`}
          content={label}
          loading={loading}
        />

        <Carousel
          opts={{
            align: 'start',
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="mx-1.5 -ml-2 md:mr-0">
            {items.map((item, i) => (
              <CarouselItem
                key={item?.model?.id || `empt${i}`}
                className={cn('pl-2 [--padding:8px]', basisClassName)}
              >
                {item ? (
                  <div className="relative rounded-md">
                    <UnifiedItemModalTrigger type={item.type} model={item.model}>
                      <div className="flex aspect-[2/3] cursor-pointer items-center justify-center transition-opacity duration-300 hover:opacity-50">
                        <UnifiedItemView type={item.type} model={item.model} />
                      </div>
                    </UnifiedItemModalTrigger>
                  </div>
                ) : (
                  <div className="border-border aspect-[2/3] rounded-md border pl-2 duration-300" />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }
);
