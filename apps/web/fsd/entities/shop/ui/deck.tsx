import type { ComponentPropsWithoutRef, ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import type { ImageProps } from 'next/image';

import Activity from '@re/ui-kit/icons/activity';
import { cn } from '@re/ui-kit/utils/cn';

import type { DeckSchema } from '~shared/api/models/shop';
import { ImageContent, ImageRoot } from '~shared/ui/image';
import * as ItemCard from '~shared/ui/item-card';

interface DeckImageProps extends Omit<ImageProps, 'width' | 'height'> {
  size: number;
}

export const DeckImage = (props: DeckImageProps) => {
  const { src, alt, size, children, ...rest } = props;

  return (
    <ImageRoot
      className="group"
      src={src}
      style={{
        width: size,
        height: size,
      }}
    >
      <ImageContent
        className="transition-all group-hover:scale-105"
        width={size}
        height={size}
        alt={alt ?? ''}
        {...rest}
      />
      {children}
      {/*<ImageFallback />*/}
    </ImageRoot>
  );
};

export interface DeckCardProps<T extends DeckSchema> extends ComponentPropsWithoutRef<'div'> {
  model: T | null;
  withPrice?: boolean;
  imageBottomSlot?: ReactNode;
  shouldBeDisabled?: boolean;
}

export const DeckCard = forwardRef(
  <T extends DeckSchema>(props: DeckCardProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      model,
      shouldBeDisabled = false,
      withPrice = false,
      className,
      imageBottomSlot,
      ...rest
    } = props;
    return (
      <ItemCard.Root withHover className={cn('bg-secondary', className)} ref={ref} {...rest}>
        <ItemCard.Content>
          <DeckImage
            children={imageBottomSlot}
            src={model?.cover?.high!}
            size={152}
            alt={model?.name ?? ''}
            className={cn({ grayscale: (withPrice && !model?.cost) || shouldBeDisabled })}
          />
        </ItemCard.Content>

        <ItemCard.Footer>
          <ItemCard.Label size="xs" lineClamp={1} weight="medium" color="muted-foreground">
            {model?.name}
          </ItemCard.Label>
          {withPrice && model?.cost ? (
            <span className="flex items-center">
              <Activity className="mr-1 size-4" />
              <ItemCard.Label align="center" size="sm" weight="medium" color="muted-foreground">
                {model?.cost}
              </ItemCard.Label>
            </span>
          ) : null}
        </ItemCard.Footer>
      </ItemCard.Root>
    );
  }
);
