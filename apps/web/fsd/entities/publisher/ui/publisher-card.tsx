import { ComponentProps, memo, ReactNode } from 'react';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import type { PublisherSchemaFragment } from '~shared/api/models/publisher';

export interface PublisherCardProps<T extends PublisherSchemaFragment> {
  model: T;
  className?: string;
  withBorder?: boolean;
}

export const PublisherCard = memo(
  <T extends PublisherSchemaFragment>(props: PublisherCardProps<T>) => {
    const {
      model,
      withBorder,
      className,
      // subtitle = (
      //   <ReText color="muted-foreground" lineClamp={1} size="xs">
      //     {model?.tagline}
      //   </ReText>
      // ),
    } = props;

    return (
      <div
        className={cn(
          'group cs-publisher-card cs-publisher-vertical-card relative flex h-full flex-col overflow-hidden select-none',
          withBorder && 'border-border items-center justify-center rounded-md border p-2',
          className
        )}
      >
        <PublisherAvatar
          imgSrc={model.cover.mid ?? ''}
          alt={model.name}
          // size={100}
          className="w-full rounded-sm object-cover transition-transform duration-300 select-none"
        />
        <div className="flex flex-col gap-1 px-1 pt-3 pb-1">
          <ReText size="sm" weight="semibold" component="span" className="break-all" lineClamp={1}>
            {model?.name}
          </ReText>
        </div>
      </div>
    );
  }
);

export const PublisherCardSkeleton = (props: ComponentProps<'div'>) => {
  const { className, ...rest } = props;

  return (
    <div {...rest} className={cn('flex flex-col gap-3', className)}>
      <SkeletonV2 className="bg-skeleton size-25" />
      <SkeletonV2 className="bg-skeleton h-4 w-full" />
    </div>
  );
};

export const PublisherHorizontalCard = memo(
  <T extends PublisherSchemaFragment>({
    actions,
    model,
    className,
    withBorder,
  }: PublisherCardProps<T> & {
    actions?: ReactNode;
  }) => (
    <div
      className={cn(
        'group flex h-full cursor-pointer items-center justify-between rounded-sm p-2',
        withBorder && 'border-border border',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <PublisherAvatar
          imgSrc={model.cover.mid ?? ''}
          alt={model.name}
          size={80}
          className="rounded-sm object-cover transition-transform duration-300 select-none group-hover:scale-110"
        />
        <span>
          <ReText lineClamp={2} align="center" size="md" className="mt-2 mb-auto">
            {model.name}
          </ReText>
          <ReText
            lineClamp={1}
            align="center"
            size="sm"
            color="muted-foreground"
            className="mt-2 mb-auto"
          >
            {model.tagline}
          </ReText>
        </span>
      </div>
      <div className="flex flex-wrap gap-4">{actions}</div>
    </div>
  )
);
