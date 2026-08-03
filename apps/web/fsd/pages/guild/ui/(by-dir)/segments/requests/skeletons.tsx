import { Skeleton } from '@re/ui-kit/ui/skeleton';

export const Skeletons = () => (
  <div className="grid grid-cols-2 gap-2">
    {new Array(10).fill(null).map((_, i) => (
      <Skeleton key={i} className="aspect-[4/1] h-[133px]" />
    ))}
  </div>
);
