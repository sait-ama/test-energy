import React, { ComponentProps, memo } from 'react';
import Image from 'next/image';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { UserAchievementSchema } from '~shared/api/models/user';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface AchievementCardProps extends ComponentProps<'div'> {
  model: UserAchievementSchema;
  className?: string;
  withHover?: boolean;
  withBorder?: boolean;
}

export const AchievementCard = memo(
  ({ model, className, withBorder = false, withHover = false, ...rest }: AchievementCardProps) => {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-1 rounded-md',
          {
            ['border-border border']: withBorder,
            ['group cursor-pointer']: withHover,
          },
          className
        )}
        {...rest}
      >
        <div className="relative overflow-hidden rounded-full">
          <Image
            draggable={false}
            src={UrlFormatter.media(model?.current?.image || model?.next?.image)}
            alt={model?.achievement?.name}
            width={80}
            height={80}
            unoptimized
            className="rounded-full object-cover transition-transform duration-300 select-none group-hover:scale-105"
          />
          <Image
            src={UrlFormatter.media(
              `public/achievements/${(model?.current || model?.next)?.level?.toLowerCase()}.webp`
            )}
            alt="frame"
            width={80}
            height={80}
            unoptimized
            draggable={false}
            className="absolute bottom-0 left-0 select-none"
          />
        </div>
        <ReText
          align="center"
          component="span"
          className="mt-2 text-xs break-words md:text-sm"
          lineClamp={2}
          color="muted-foreground"
        >
          {`${model?.achievement?.name} ${(model?.current || model?.next)?.level}`}
        </ReText>
      </div>
    );
  }
);

export const AchievementSkeleton = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <SkeletonV2 className={cn('bg-skeleton size-20 rounded-full', className)} {...rest} />
      <div className="flex w-full flex-col items-center gap-1">
        <SkeletonV2 className="bg-skeleton flex h-4 w-3/4 items-center" />
        <SkeletonV2 className="bg-skeleton flex h-4 w-2/5 items-center" />
      </div>
    </div>
  );
};
