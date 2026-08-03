'use client';

import { type ComponentPropsWithoutRef, useMemo } from 'react';

import {
  type DefaultError,
  type InfiniteData,
  useSuspenseInfiniteQuery,
  type UseSuspenseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { Masonry, useInfiniteLoader } from 'masonic';

import { MomentItemWithPreviewModal } from '~entities/inventory/ui/item/moment-item';
import type { MomentPaginatedListResponseSchema } from '~shared/api/models/title';
import { deduplicate } from '~shared/utils/record-deduplicator';

export interface MomentsMasonryListProps extends ComponentPropsWithoutRef<'div'> {
  options: UseSuspenseInfiniteQueryOptions<
    MomentPaginatedListResponseSchema,
    DefaultError,
    InfiniteData<MomentPaginatedListResponseSchema>
  >;
}

export const MomentsMasonryList = (props: MomentsMasonryListProps) => {
  const { className, options } = props;

  const { data, fetchNextPage } = useSuspenseInfiniteQuery(options);
  const moments = useMemo(
    () =>
      deduplicate(data?.pages.flatMap((v) => v.results.filter(Boolean)) ?? [], (v) => v.id) || [],
    [data]
  );
  const maybeLoadMore = useInfiniteLoader(() => fetchNextPage(), {
    isItemLoaded: (index, items) => !!items[index],
    minimumBatchSize: 20,
    threshold: 3,
  });
  return (
    <Masonry
      key={moments.length}
      onRender={maybeLoadMore}
      items={moments}
      itemKey={(v) => {
        return v.id;
      }}
      columnGutter={8}
      columnWidth={172}
      overscanBy={1.25}
      className={className}
      render={({ data }) => <MomentItemWithPreviewModal key={data.id} model={data} />}
    />
  );
};
