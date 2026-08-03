'use client';

import type { MouseEvent, ReactNode } from 'react';
import { forwardRef } from 'react';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { UseHeroCardControlsOptions } from '~entities/inventory/model/hooks';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import type { HeroCardPreviewModalProps } from '~entities/inventory/ui/hero-card-preview';
import type { HeroCardSchema } from '~shared/api/models/inventory';
import * as InventoryItem from '~shared/ui/item-card';

export interface HeroCardItemProps extends HeroCardPreviewModalProps {
  card?: HeroCardSchema;
  loading?: boolean;
  isActive?: boolean;
  withClose?: boolean;
  onClose?: () => void;
  floatingSlot?: ReactNode;
  controlsOptions?: UseHeroCardControlsOptions;
}

export const HeroCardItem = forwardRef((props: HeroCardItemProps, _ref) => {
  const {
    card,
    loading,
    isActive,
    floatingSlot,
    onClick,
    withClose,
    className,
    onClose,
    controlsOptions,
    ...rest
  } = props;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <InventoryItem.Root
      className={cn('cs-inventory-card', className, 'relative')}
      withHover={!loading}
      isActive={isActive}
      onClick={handleClick}
      {...rest}
    >
      <InventoryItem.Content className="aspect-[2/3]">
        <HeroCard
          loading={loading}
          card={card}
          className="h-full"
          floatingSlot={floatingSlot}
          controlsOptions={{
            rewrites: {
              isSoundEnabled: false,
            },
          }}
        />
      </InventoryItem.Content>
      {withClose || onClose ? (
        <InventoryItem.RightCorner>
          <Button
            color="secondary"
            circle
            size="sm"
            className={cn(
              'rounded-full' // backdrop-blur-[3px]
            )}
            onClick={() => {
              onClose?.();
            }}
          >
            <Close className="size-4" />
          </Button>
        </InventoryItem.RightCorner>
      ) : null}

      <InventoryItem.Footer>
        <InventoryItem.Label>Карта</InventoryItem.Label>
        {loading || card?.rank ? (
          <div className="min-w-[40%]">
            <ReText weight="medium" size="sm" align="center">
              {loading ? <Skeleton /> : ` Ранг ${card?.rank?.slice(5).toUpperCase() || 'X'}`}
            </ReText>
          </div>
        ) : null}
      </InventoryItem.Footer>
    </InventoryItem.Root>
  );
});
