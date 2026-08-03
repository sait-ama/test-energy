import { Skeleton } from '@re/ui-kit/ui/skeleton';

export const FriendCardSkeleton = () => (
  <div className="border-border bg-background/60 text-card-foreground rounded-md border p-2">
    <div className="flex flex-row items-center gap-2">
      <span>
        <Skeleton className="size-[80px] rounded-full" />
      </span>
      <div className="flex flex-col items-start gap-1 self-start">
        <Skeleton className="mt-2 h-[19.75px] w-[60px]" />
        <Skeleton className="mt-2 h-[19.75px] w-[90px]" />
      </div>
    </div>
  </div>
);
