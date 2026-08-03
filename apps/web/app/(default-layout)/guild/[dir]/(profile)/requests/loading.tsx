import { Skeleton } from '@re/ui-kit/ui/skeleton';

export default () => (
  <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
    {new Array(10).fill(null).map((_, i) => (
      <Skeleton key={i} className="aspect-[4/1] h-[133px]" />
    ))}
  </div>
);
