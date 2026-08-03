import React, { ComponentProps, memo, ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { MediaContent, MediaFallback, MediaRoot } from '@re/ui-kit/ui/media';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { resolvedName } from '~entities/card-collections/model/utils';
import { safeResolveCollectionCover } from '~entities/collection/model/utils';
import { TitleCardRoot } from '~entities/title/ui/title-card-base/title-card-base';
import type { CollectionSchema } from '~shared/api/models/collectionSchema';
import Title from '~shared/assets/placeholders/title';
import { Routing } from '~shared/config/routing';
import { FanItem, FanLayout, FanPosition } from '~shared/ui/fan-collections/fan-collections';
import { UrlFormatter } from '~shared/utils/url-formatter';

const handleActionsClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
};

export const CollectionCard = memo(
  ({
    model,
    actions,
    className,
    withDescription,
    containerClassName,
    internalClassName,
    withShadow = false,
  }: {
    model: CollectionSchema;
    actions?: ReactNode;
    className?: string;
    internalClassName?: string;
    containerClassName?: string;
    withDescription?: boolean;
    withShadow?: boolean;
  }) => {
    const t = useTranslations('collection-item');
    const cover = safeResolveCollectionCover(model?.cover);
    const isCustomCard = !cover || cover?.includes('None');

    return (
      <div
        className={cn(
          'border-border collection-background @container relative flex aspect-square h-full flex-col overflow-hidden rounded-md border',
          {
            'shadow-md': withShadow,
            'hover:border-primary': !actions,
          },
          containerClassName
        )}
      >
        <Link
          shallow={false}
          prefetch={false}
          href={Routing.Collection.getByID({ params: { id: model.id } })}
          title={t('name', { name: model.name })}
          className={cn('relative block h-full', className)}
        >
          <div className="z-35 flex w-full flex-col items-center px-4 pt-4">
            <ReText
              className={cn(
                'text-md @min-[220px]:text-md font-semibold select-none @min-[220px]:font-medium',
                {
                  'text-center': !withDescription,
                }
              )}
              lineClamp={1}
              style={{ lineHeight: 1.2 }}
            >
              {resolvedName(model.name)}
            </ReText>
          </div>

          <div className="group size-full overflow-hidden transition-colors duration-200">
            <div
              className={cn(
                'relative flex h-full w-full flex-col items-start justify-end',
                "after:content-[' '] after:absolute after:top-0 after:right-0 after:bottom-0 after:left-0 after:h-full after:w-full after:rounded",
                // 'collection-background',
                'overflow-hidden',
                'aspect-square',
                internalClassName
              )}
            >
              {!isCustomCard ? (
                <MediaRoot style={{ clipPath: 'inset(1px)' }} className="w-full" src={cover}>
                  <MediaContent
                    alt={t('img-alt', { name: model.name })}
                    className={cn(
                      'h-full w-full transition-transform duration-300 select-none group-hover:scale-105'
                    )}
                  />
                  <MediaFallback />
                </MediaRoot>
              ) : (
                <FanLayout size="lg" className="absolute top-[5%] size-full">
                  {[FanPosition.LEFT, FanPosition.CENTER, FanPosition.RIGHT].map(
                    (position, index) => (
                      <FanItem className="aspect-[2/3]" position={position} asChild key={index}>
                        <TitleCardRoot className="rounded-md">
                          <MediaRoot
                            className="size-full shrink"
                            src={UrlFormatter.media(model?.titles?.[index]?.cover?.high)}
                          >
                            <MediaContent
                              alt={t('img-alt', {
                                name: model?.titles?.[index]?.main_name || model.name,
                              })}
                              className="w-full object-cover"
                            />
                            <MediaFallback className="bg-secondary border-border flex h-full w-full items-center rounded-md border border-2">
                              <Title className="text-border size-12" />
                            </MediaFallback>
                          </MediaRoot>
                        </TitleCardRoot>
                      </FanItem>
                    )
                  )}
                </FanLayout>
              )}
            </div>
          </div>
        </Link>

        {actions && (
          <div
            className={cn(
              'from-card/80 absolute right-0 bottom-0 left-0 z-40 bg-gradient-to-t to-transparent p-2 pt-6',
              !actions && 'hidden'
            )}
            onClick={handleActionsClick}
            onMouseDown={handleActionsClick}
          >
            {actions}
          </div>
        )}
      </div>
    );
  }
);

export const CollectionCardSkeleton = (props: ComponentProps<'div'>) => {
  const { className, ...rest } = props;
  return <SkeletonV2 className={cn('bg-skeleton h-72 w-full rounded-sm', className)} {...rest} />;
};
