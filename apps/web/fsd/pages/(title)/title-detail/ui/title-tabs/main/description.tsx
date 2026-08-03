'use client';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { ExpandableV2 } from '~shared/ui/expandable-v2';

import { useCurrentPageSuspenseTitleDetail } from '../../../model/queries';

export const Description = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  return (
    <div className="bg-secondary dark:bg-background/50 rounded-md p-2 md:p-4">
      <ExpandableV2 text={data!.description} rows={3} className="text-foreground" />
    </div>
  );
};

export const DescriptionSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-2 rounded-md py-2 md:py-4">
      <Skeleton className="h-6 w-4/5 rounded-full" containerClassName="w-full" />
      <Skeleton className="h-6 w-2/5 rounded-full" containerClassName="w-full" />
      <Skeleton className="h-6 w-3/5 rounded-full" containerClassName="w-full" />
    </div>
  );
};
