import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { ActivityItemSkeleton } from '~entities/activity/ui/activity-item-skeleton';
import { ActivityItemSkeletonList } from '~entities/activity/ui/activity-item-skeleton-list';

export const DefaultLoading = () => (
  <div className="my-2 flex flex-col gap-4">
    <Skeleton className="h-[53px] w-full" />
    <div className="flex flex-row gap-2 p-2">
      <Skeleton className="h-[28px] w-[56px]" />
      <Skeleton className="h-[28px] w-[56px]" />
    </div>
    <ActivityItemSkeletonList SkeletonItem={ActivityItemSkeleton} count={5} max={5} />
  </div>
);
