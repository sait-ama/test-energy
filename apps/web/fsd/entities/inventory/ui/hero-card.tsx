'use client';
import { ComponentProps, ComponentType, CSSProperties, memo, ReactNode, useRef } from 'react';

import VolumeOn from '@re/ui-kit/icons/volume-on';
import * as MediaPrimitive from '@re/ui-kit/ui/media';
import { Skeleton, SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import type { ShortCardItemSchema } from '~shared/api/models/shop';
import { MediaFallback } from '~shared/ui/media';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { useHeroCardControls, UseHeroCardControlsOptions } from '../model/hooks';

const baseClassName =
  '!rounded-[6%_/_4%] size-full aspect-[2/3] border select-none overflow-hidden';

export const HeroCardSkeleton = ({ className, ...rest }: { className?: string }) => (
  <div className={cn(baseClassName, 'border-transparent', className)}>
    <Skeleton className="size-full" {...rest} />
  </div>
);

export const HeroCardSkeletonV2 = (props: ComponentProps<'div'>) => {
  const { className, ...rest } = props;
  return (
    <SkeletonV2
      className={cn('bg-skeleton aspect-[2/3] size-full !rounded-[6%_/_4%]', className)}
      {...rest}
    />
  );
};

export type HeroCardProps<M extends ShortCardItemSchema, T extends ComponentType> = {
  card?: M | null | undefined;
  imgSize?: 'low' | 'mid' | 'high';
  onClick?: () => void;
  withHover?: boolean;
  withBorder?: boolean;
  active?: boolean;
  loading?: boolean;
  empty?: boolean;
  draggable?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  faceDown?: boolean;
  imgClassName?: string;
  floatingSlot?: ReactNode;
  controlsOptions?: UseHeroCardControlsOptions;
  // playControlsSlot?: ReactNode;
  // soundControlsSlot?: ReactNode;
  component?: T;
} & ComponentProps<T>;

export const HeroCard = memo(
  <M extends ShortCardItemSchema, T extends ComponentType>(props: HeroCardProps<M, T>) => {
    const {
      card,
      withHover,
      onClick,
      imgSize = 'mid',
      draggable = false,
      active = false,
      loading = false,
      withBorder = false,
      className,
      // children,
      component,
      imgClassName,
      floatingSlot,
      faceDown = false,
      controlsOptions,
      ...rest
    } = props;

    const mediaRef = useRef<HTMLVideoElement | null>(null);
    useHeroCardControls(mediaRef, controlsOptions);

    const Comp = component || 'div';
    if (loading) return <HeroCardSkeleton className={className} />;

    if (!card)
      return (
        <Comp
          className={cn(
            baseClassName,
            withBorder ? 'border-border' : 'border-transparent',
            className
          )}
          {...rest}
        />
      );

    const img = faceDown
      ? UrlFormatter.media('public/modal/random-card.webp')
      : UrlFormatter.media(card.cover?.[imgSize]);

    const floatingSlotFallback = card.has_audio ? (
      <div className="bg-background/70 absolute top-2 right-2 rounded-full px-3 py-2">
        <VolumeOn />
      </div>
    ) : null;

    return (
      <Comp
        onClick={onClick}
        className={cn(
          baseClassName,
          'cs-card-item cs-card-item group relative',
          {
            ['cursor-pointer transition-all duration-100']: withHover ?? !!onClick,
            ['border-border']: withBorder,
            ['!border-primary']: active,
            ['border-transparent']: !active && !withBorder,
          },
          className
        )}
        {...rest}
      >
        <MediaPrimitive.Root src={img} className={cn('w-full', imgClassName)}>
          <MediaPrimitive.Content
            style={{
              userSelect: 'none',
              // @ts-ignore
              unselectable: 'on',
              pointerEvents: 'none',
            }}
            ref={mediaRef}
            fill
            alt={card.character?.name || 'Коллекционная карточка'}
            className="relative aspect-[2/3] size-full select-none"
          />
          <MediaFallback>
            <div className="bg-secondary size-full"></div>
          </MediaFallback>
        </MediaPrimitive.Root>
        {floatingSlot || floatingSlotFallback}
        {/* {typeof img === 'string' && img.endsWith('webm') ? playControlsSlot : null} */}
        {/* {card.has_audio ? soundControlsSlot : null} */}
      </Comp>
    );
  }
);
