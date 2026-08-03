import { Skeleton } from '@re/ui-kit/ui/skeleton';

interface SimilarListSkeletonProps {}

export const SimilarListSkeleton = (props: SimilarListSkeletonProps) => {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-skeleton/50 dark:bg-background/50 flex flex-row gap-3 rounded-md dark:p-2"
        >
          <Skeleton key={index} className="aspect-[2/3] h-[105px] w-full" />
          <div className="flex w-full flex-col justify-center">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
