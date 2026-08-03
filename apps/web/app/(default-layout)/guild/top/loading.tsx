import React from 'react';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

import {
  ListItemSkeleton,
  ListTopContentRoot,
  ListTopRoot,
  ListTopThreeRoot,
  TopItemSkeleton,
} from '~shared/ui/item-top';

export default function RootLoading() {
  return (
    <>
      <div className="flex flex-col items-center gap-8 overflow-hidden md:gap-16">
        <SkeletonV2 className="bg-skeleton h-8 w-42" />

        <ListTopRoot>
          <ListTopThreeRoot>
            <TopItemSkeleton className="justify-end" />
            <TopItemSkeleton className="justify-start" />
            <TopItemSkeleton className="justify-end" />
          </ListTopThreeRoot>
          <ListTopContentRoot>
            {Array(8)
              .fill(null)
              .map((_, index) => (
                <ListItemSkeleton key={index} />
              ))}
          </ListTopContentRoot>
        </ListTopRoot>
      </div>
    </>
  );
}
