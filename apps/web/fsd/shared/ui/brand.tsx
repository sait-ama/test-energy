'use client';

import { lazy, Suspense } from 'react';
import Image from 'next/image';

import Brand from '@re/ui-kit/icons/brand';
import { cn } from '@re/ui-kit/utils/cn';

import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';
import { UrlFormatter } from '~shared/utils/url-formatter';

const BrandHalloween = lazy(() => import('@re/ui-kit/icons/brand-halloween'));

interface BrandIconProps {
  className?: string;
  size?: number;
}

const IconRenderer = ({
  event,
  className,
  ...props
}: { event: EventDateType } & BrandIconProps) => {
  switch (event) {
    case EventDateType.DEFAULT:
      return <Brand className={className} {...props} />;
    case EventDateType.HALLOWEEN:
      return <BrandHalloween className={className} {...props} />;
    case EventDateType.NEW_YEAR:
      return (
        <Image
          className={cn(
            'absolute top-0 left-0 z-50 -translate-x-[8px] -translate-y-[4px]',
            className
          )}
          src={UrlFormatter.media('public/new-year/new-year-hat.webp')}
          alt="new-year-hat"
          {...props}
          width={props?.size ?? 36}
          height={props?.size ?? 36}
        />
      );
    default:
      return <Brand className={className} {...props} />;
  }
};
const Icon = (props: BrandIconProps) => {
  // const isNewYear = isNewYearDate();
  // const is14February = is14FebruaryDate();
  const event = getEvent();
  return (
    <div className="dark:text-foreground relative text-black">
      <IconRenderer event={event} {...props} />
      {/* {isNewYear ? (
        <Image
          className="absolute top-0 left-0 z-50 -translate-x-[8px] -translate-y-[4px]"
          src={UrlFormatter.media('public/new-year/new-year-hat.webp')}
          alt="new-year-hat"
          width={36}
          height={36}
        />
      ) : null} */}
      {/* {is14February ? <Brand14February {...rest} /> : <Brand {...rest} />} */}
      {/*<Brand {...rest} />*/}
    </div>
  );
};

export const BrandIcon = (props: BrandIconProps) => {
  return (
    <Suspense>
      <Icon {...props} />
    </Suspense>
  );
};
