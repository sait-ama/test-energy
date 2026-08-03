import { ComponentProps, memo } from 'react';
import React from 'react';
import Link from 'next/link';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import type { PublisherSchemaFragment } from '~shared/api/models/publisher';
import { Routing } from '~shared/config/routing';

interface CardProps<T extends PublisherSchemaFragment> extends ComponentProps<'a'> {
  model: T | null;
  className?: string;
  isLoading?: boolean;
}

export const HorizontalPublisherCard = memo(
  <T extends PublisherSchemaFragment>(props: CardProps<T>) => {
    const { model, isLoading, ref, className, ...rest } = props;

    return (
      <Link
        href={Routing.Publisher.detail({ params: { dir: model?.dir, tab: 'about' } })}
        className={cn(
          'bg-background-content group flex items-center gap-4 overflow-hidden rounded-md p-2',
          !isLoading && 'hover-card',
          className
        )}
        ref={ref}
        {...rest}
      >
        <SkeletonSlot
          show={isLoading}
          className="h-[64px] w-[64px]"
          render={
            <PublisherAvatar imgSrc={model?.cover?.mid ?? ''} alt={`${model?.name}`} size={64} />
          }
        />

        <div className="flex w-full flex-col pr-2">
          <ReText size="md" lineClamp={1}>
            <SkeletonSlot show={isLoading} width="50%" render={model?.name} />
          </ReText>
          <ReText
            size="xs"
            color="muted-foreground"
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <SkeletonSlot
              show={isLoading}
              width={30}
              render={
                <>
                  {model?.tagline}
                  {/*<Like size={14} className="mb-px fill-foreground" />*/}
                  {/*{getAbbreviatedNumber(model?.id)}*/}
                </>
              }
            />
          </ReText>
        </div>
      </Link>
    );
  }
);
