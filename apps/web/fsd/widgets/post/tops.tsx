'use client';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

import { TopPostsContent, TopPostsRoot, TopPostsTitle } from '~features/(post)/top-posts';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

const SkeletonPosts = () => (
  <div className="flex w-full flex-col gap-3">
    {new Array(8).fill(null).map((_, key) => (
      <div key={key} className="flex flex-col gap-2 px-4 py-2 first:pt-0 last:pb-0">
        <div className="flex items-center gap-2">
          <SkeletonV2 className="bg-skeleton size-9 rounded-sm" />
          <SkeletonV2 className="bg-skeleton h-4 w-1/3 rounded-sm" />
        </div>
        <SkeletonV2 className="bg-skeleton h-4 w-3/4 rounded-sm" />
        <div className="flex gap-2">
          <SkeletonV2 className="bg-skeleton h-4 w-2/5 rounded-sm" />
        </div>
      </div>
    ))}
  </div>
);

export const Tops = () => (
  <TopPostsRoot>
    <TopPostsTitle>Популярное за неделю</TopPostsTitle>
    <QuerySuspenseContainer fallback={<SkeletonPosts />}>
      <TopPostsContent />
    </QuerySuspenseContainer>
  </TopPostsRoot>
);
