'use client';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export default function Loading() {
  const FlatList: FlatListType<TitleSchemaFragment[]> = _FlatList;

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-2">
        {new Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16" />
        ))}
      </div>
      <div>
        <FlatList.Root isLoading>
          <FlatList.Layout layout="grid">
            <FlatList.Loading count={10}>
              {({ key }) => <VerticalTitleCardSkeleton key={key} />}
            </FlatList.Loading>
          </FlatList.Layout>
        </FlatList.Root>
      </div>
    </div>
  );
}
