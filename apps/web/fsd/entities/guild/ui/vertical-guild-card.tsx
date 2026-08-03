'use client';

import { ComponentProps, CSSProperties, memo, MouseEvent, ReactNode, RefObject } from 'react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { SkeletonSlot, SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { ClubListSchema, ClubSchemaFragment } from '~shared/api/models/guild-club';
import { Routing } from '~shared/config/routing';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface VerticalGuildCardProps<T extends ClubSchemaFragment> {
  model: T | null;
  subtitle?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  imgClassName?: string;
  isLoading?: boolean;
  isMain?: boolean;
  isActive?: boolean;
  disableLink?: boolean;
  withBorder?: boolean;
  initialInView?: boolean;
  size?: number;
  ref?: RefObject<HTMLAnchorElement>;

  [key: `data-${string}`]: number | boolean;
}

export const VerticalGuildCard = memo(
  <T extends ClubListSchema>(props: VerticalGuildCardProps<T>) => {
    const {
      model,
      isLoading,
      subtitle = (
        <ReText color="muted-foreground" lineClamp={1} size="xs">
          <SkeletonSlot show={isLoading} render={`${model?.cur_level} уровень`} />
        </ReText>
      ),
      className,
      style,
      isActive = false,
      isMain = false,
      withBorder = false,
      initialInView = false,
      size,
      ref,
      ...rest
    } = props;

    const mainGuildPrefix = isMain ? <>✦&nbsp;&nbsp;</> : null;

    return (
      <Link
        ref={ref}
        href={Routing.Club.clubByDir({
          params: {
            dir: model?.dir,
            tab: 'about',
          },
        })}
        className={cn(
          'group cs-guild-card cs-guild-vertical-card relative flex h-full flex-col overflow-hidden select-none',
          withBorder && 'border-border items-center justify-center rounded-md border p-2',
          className
        )}
        style={style}
        title={model?.name}
        data-id={model?.id}
        prefetch={false}
        shallow={false}
        {...rest}
      >
        <Avatar
          src={UrlFormatter.media(model?.avatar?.mid || '')}
          className={cn('aspect-square overflow-hidden rounded-sm select-none', className)}
          style={{ ...style, width: size, height: size }}
        >
          <AvatarImage alt={model?.name || ''} width={size} height={size} className="rounded-sm" />
          <AvatarFallback>{model?.name}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 px-1 pt-3 pb-1">
          <ReText
            size="sm"
            weight="semibold"
            component="span"
            className="break-all whitespace-normal"
            lineClamp={1}
          >
            <SkeletonSlot
              count={0.7}
              render={
                <>
                  {mainGuildPrefix}
                  {model?.name}
                </>
              }
              show={isLoading}
            />
          </ReText>
          {subtitle ? <div className="flex items-center justify-between">{subtitle}</div> : null}
        </div>
      </Link>
    );
  }
);

VerticalGuildCard.displayName = 'VerticalGuildCard';

export const VerticalGuildCardSkeleton = (props: ComponentProps<'div'>) => {
  const { className, ...rest } = props;

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      <SkeletonV2 className="bg-skeleton size-25" />
      <SkeletonV2 className="bg-skeleton h-4 w-full" />
    </div>
  );
};
