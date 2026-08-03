import React from 'react';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

import { Container } from '~shared/ui/container';
import {
  ListItemSkeleton,
  ListTopContentRoot,
  ListTopRoot,
  ListTopThreeRoot,
  TopItemSkeleton,
} from '~shared/ui/item-top';

export default function RootLoading() {
  return (
    <Container layout="tiny" className="my-8">
      <div className="flex flex-col items-center gap-8 overflow-hidden md:gap-16">
        <div className="flex w-full flex-col gap-6 md:items-center md:justify-center">
          <SkeletonV2 className="bg-skeleton h-8 w-42" />
          <div className="flex w-full items-center justify-center gap-2 overflow-auto">
            {Array(6)
              .fill(null)
              .map((_, index) => (
                <SkeletonV2 key={index} className="bg-skeleton h-8 w-20" />
              ))}
          </div>
        </div>
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
    </Container>
  );
}
