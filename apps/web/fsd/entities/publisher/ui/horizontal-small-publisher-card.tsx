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
  model: T;
  className?: string;
  isLoading?: boolean;
}

export const HorizontalSmallPublisherCard = memo(
  <T extends PublisherSchemaFragment>(props: CardProps<T>) => {
    const { model, isLoading, ref, className, ...rest } = props;

    return (
      <Link
        prefetch={false}
        href={Routing.Publisher.detail({ params: { dir: model?.dir, tab: 'about' } })}
        className={cn(
          'hover-card group flex items-center gap-3 overflow-hidden rounded-md px-2 py-1',
          className
        )}
        ref={ref}
        {...rest}
      >
        <PublisherAvatar
          isLoading={isLoading}
          imgSrc={model.cover.mid ?? ''}
          alt={`Аватар паблишера ${model.name}`}
          size={24}
        />
        <ReText size="sm" lineClamp={1} component="span" className="!leading-none">
          <SkeletonSlot show={isLoading} width="50%" render={model.name} />
        </ReText>
      </Link>
    );
  }
);
