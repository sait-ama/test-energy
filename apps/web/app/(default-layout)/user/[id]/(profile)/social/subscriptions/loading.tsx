'use client';
import { Skeleton } from '@re/ui-kit/ui/skeleton';

export default () => (
  <div className="space-y-4">
    <div className="flex flex-row gap-2">
      {new Array(3).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-6 w-16" />
      ))}
    </div>
    <div></div>
  </div>
);
