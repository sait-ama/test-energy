import { Skeleton } from '@re/ui-kit/ui/skeleton';

export const ActivityItemSkeleton = () => (
  <div className="mb-4 flex w-full flex-row gap-4">
    <Skeleton className="size-10 rounded-full" />
    <div className="flex w-full flex-col gap-2">
      <Skeleton className="aspect-[7/1] max-h-[90px] w-full" containerClassName="w-full" />
      <Skeleton className="h-4 w-12" containerClassName="w-full" />
    </div>
  </div>
);
