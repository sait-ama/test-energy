import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

export const UserPaymentsHistoryListLoading = () => (
  <div className="bg-secondary flex flex-col rounded-md px-4 py-2">
    {new Array(3).fill(null).map((_, i) => (
      <div key={i} className="flex justify-between gap-2 py-2">
        <SkeletonV2 className="bg-background h-[37px] w-[15%]" />
        {/*<SkeletonV2 className="bg-background h-[37px] w-[35%]" />*/}
        <SkeletonV2 className="bg-background h-[37px] w-1/4" />
        <SkeletonV2 className="bg-background h-[37px] w-1/4" />
      </div>
    ))}
  </div>
);
