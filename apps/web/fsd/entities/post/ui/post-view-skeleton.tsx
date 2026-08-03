import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

export const PostSkeletonTitle = ({ withImage }: { withImage?: boolean }) => (
  <div className="bg-secondary dark:border-border flex w-full flex-col gap-4 rounded-md p-4 dark:border">
    <div className="flex flex-row gap-4">
      {/*<Skeleton style={{ borderRadius: 8 }} width={40} height={60} />*/}
      <div className="flex w-max flex-1 flex-col gap-2">
        <div className="flex w-full flex-row items-center justify-between gap-2 self-start">
          <div className="flex flex-row items-center justify-between gap-2 self-start">
            <Skeleton style={{ borderRadius: 100 }} width={24} height={24} />
            <Skeleton
              className="mt-[3px] ml-2 w-[65px] self-center"
              style={{ borderRadius: 8 }}
              height={16}
            />
          </div>

          <Skeleton
            className="mt-[3px] ml-2 self-end"
            style={{ borderRadius: 8 }}
            width={65}
            height={16}
          />
        </div>

        <Skeleton className="self-start" style={{ borderRadius: 8 }} width="100%" height={20} />
      </div>
    </div>
    {withImage && <Skeleton className="h-[280px] w-full" />}
    {/*<Skeleton style={{ borderRadius: 8 }} height={20} />*/}
    {/*<Skeleton style={{ borderRadius: 8 }} height={20} />*/}
    {/*<Skeleton style={{ borderRadius: 8 }} /!**!/width={280} height={20} />*/}
  </div>
);

export const PostSkeletonWithoutTitle = ({
  withImage,
  className,
}: {
  withImage?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      'bg-secondary dark:border-border flex w-full flex-col gap-4 rounded-md p-4 dark:border',
      className
    )}
  >
    <div className="flex w-full flex-row gap-4">
      <div className="flex w-max flex-col gap-2">
        <div className="flex w-max flex-row items-center justify-between gap-2 self-start">
          <div className="flex flex-row items-center justify-between gap-2 self-start">
            <Skeleton style={{ borderRadius: 100 }} width={24} height={24} />
            {/*<Skeleton className="mt-[3px] self-center" style={{ borderRadius: 8 }} width={150} height={16} />*/}
            <Skeleton
              className="mt-[3px] ml-2 self-center"
              style={{ borderRadius: 8 }}
              width={65}
              height={16}
            />
          </div>
          <Skeleton
            className="mt-[3px] ml-2 self-end"
            style={{ borderRadius: 8 }}
            width={65}
            height={16}
          />
        </div>
        <Skeleton className="self-start" style={{ borderRadius: 8 }} width="100%" height={20} />
      </div>
    </div>
    <Skeleton style={{ borderRadius: 8 }} width="100%" height={20} />
    {withImage && <Skeleton className="h-[280px] w-full" />}

    {/*<Skeleton style={{ borderRadius: 8 }} width={280} height={20} />*/}
  </div>
);
