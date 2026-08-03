import React, { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface InternalEntity {
  id: number;
  title: string;
  icon?: ReactNode;
  count: number;
  imgSource: string;
  footer?: ReactNode;
  href: string;
}

export const TopItem = ({
  entity,
  place,
  justify = 'end',
}: {
  entity: InternalEntity;
  place: 1 | 2 | 3;
  justify?: 'start' | 'end';
}) => (
  <Link
    href={entity.href}
    className={cn(
      'flex h-[188px] w-[104px] flex-col items-center gap-4 transition-opacity sm:w-[140px] md:w-40',
      justify === 'start' ? 'justify-start' : 'justify-end'
    )}
  >
    <div className="relative w-fit">
      <div
        className={cn(
          'absolute -top-4 right-0 left-0 z-10 mx-auto grid h-5 w-5 place-items-center rounded-full border text-xs font-bold text-yellow-50 sm:-top-6 sm:h-9 sm:w-9 sm:text-2xl',
          place === 1 && 'border-yellow-200 bg-yellow-500',
          place === 2 && 'border-grey-300 bg-neutral-500',
          place === 3 && 'border-yellow-600 bg-yellow-700'
        )}
      >
        {place}
      </div>
      <Avatar
        src={UrlFormatter.media(entity.imgSource)}
        className="relative size-20 rounded-xl md:size-28"
      >
        <AvatarImage alt={entity.title} draggable={false} className="rounded-sm object-cover" />
        <AvatarFallback className="flex h-full w-full items-center justify-center">
          {entity.title}
        </AvatarFallback>
      </Avatar>
    </div>
    <div className="flex flex-col items-center">
      <ReText weight="semibold" align="center" className="line-clamp-1 max-w-32 truncate">
        {entity.title}
      </ReText>
      <div className="flex items-center gap-2">
        <span className="text-md text-muted-foreground font-medium">
          {getAbbreviatedNumber(entity.count)}
        </span>
        {entity.icon}
      </div>
    </div>
    {entity.footer && <div>{entity.footer}</div>}
  </Link>
);

interface TopItemSkeletonProps extends ComponentProps<'div'> {}

export const TopItemSkeleton = (props: TopItemSkeletonProps) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        'flex h-[188px] w-[104px] flex-col items-center gap-4 transition-opacity hover:opacity-60 sm:w-[140px] md:w-40',
        className
      )}
      {...rest}
    >
      <SkeletonV2 className="bg-skeleton flex size-20 md:size-28" />
      <div className="flex flex-col items-center gap-2">
        <SkeletonV2 className="bg-skeleton h-4 w-32" />
        <SkeletonV2 className="bg-skeleton h-4 w-8" />
      </div>
    </div>
  );
};

export const ListItem = ({ model, index }: { model: InternalEntity; index: number }) => (
  <Link
    href={model.href}
    className="hover:bg-background flex h-16 cursor-pointer items-center gap-3 rounded-xl px-4 py-2 transition-all"
  >
    <ReText color="muted-foreground" size="sm" weight="semibold" className="min-w-6">
      {index}
    </ReText>
    <div className="flex flex-1 items-center gap-4">
      <Avatar src={UrlFormatter.media(model.imgSource)} className="size-12">
        <AvatarImage alt={model.title} draggable={false} className="rounded-sm object-cover" />
        <AvatarFallback className="flex h-full w-full items-center justify-center">
          {model.title}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-32 truncate">{model.title}</span>
    </div>
    <div className="flex items-center gap-1">
      {model.icon}
      <span className="font-medium">{getAbbreviatedNumber(model.count)}</span>
    </div>
  </Link>
);

interface ListItemSkeletonProps extends ComponentProps<'div'> {}

export const ListItemSkeleton = (props: ListItemSkeletonProps) => {
  const { className, ...rest } = props;

  return (
    <div className={cn('flex h-16 items-center gap-3 rounded-md px-4', className)} {...rest}>
      <SkeletonV2 className="bg-skeleton flex h-6 min-h-6 w-6 min-w-6" />
      <div className="flex w-full flex-1 items-center gap-4">
        <SkeletonV2 className="bg-skeleton size-10 min-h-10 min-w-10" />
        <SkeletonV2 className="bg-skeleton h-4 w-32 md:w-52" />
      </div>
      <SkeletonV2 className="bg-skeleton h-4 w-6" />
    </div>
  );
};

export const ListTopRoot = (props: ComponentProps<'div'>) => {
  const { className, children, ...rest } = props;
  return (
    <div className={cn('relative flex w-full flex-col gap-8', className)} {...rest}>
      {children}
    </div>
  );
};

export const ListTopThreeRoot = (props: ComponentProps<'div'>) => {
  const { className, children, ...rest } = props;

  return (
    <div className={cn('flex justify-center gap-x-4 py-5 md:gap-x-6', className)} {...rest}>
      {children}
    </div>
  );
};

export const ListTopContentRoot = (props: ComponentProps<'div'>) => {
  const { className, children, ...rest } = props;

  return (
    <div
      className={cn(
        'bg-card relative flex flex-col gap-2 overflow-hidden rounded-md px-3 py-3',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
