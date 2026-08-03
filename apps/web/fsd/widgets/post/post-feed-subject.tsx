'use client';
import React, { ReactNode, useMemo, useState } from 'react';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { createContext } from '@re/core/utils/create-context';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { cn } from '@re/ui-kit/utils/cn';

import { getPostsPaginatedSuspenseListQueryOptions } from '~entities/post/model/queries';
import { renderPostsSkeleton } from '~entities/post/ui/post-skeletons-list';
import { GlobalImagePreviewAsync } from '~shared/lib/multy-image-preview/ui/global-image-preview.async';
import { ScrollToTop } from '~shared/lib/react/scroll-to-top';
import { FlatList } from '~shared/ui/flat-list-v2';
import { deduplicate } from '~shared/utils/record-deduplicator';
import { PostPreview } from '~widgets/post/(forum)/(post)/post-preview';

const sortVariantsAlt = [
  { value: 'id', label: 'Старые' },
  { value: '-id', label: 'Новые' },
  { value: '-score', label: 'По лайкам' },
  // { value: 'week', label: 'За неделю' },
];

const { Provider: PostQueryProvider, useStore: usePostQueryStore } = createContext(() => {
  const [ordering, setOrdering] = useState<string>('-id');

  return {
    ordering,
    setOrdering,
  };
});

interface PostContentProps {
  query:
    | { publisher?: string }
    | {
        user?: string;
      }
    | { club?: string }
    | { target_type: 'title'; target_id: string };
}

export const PostContent = (props: PostContentProps) => {
  const { query } = props;
  const { ordering } = usePostQueryStore();

  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    fetchNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
  } = useApiGenSuspenseInfiniteQuery(
    getPostsPaginatedSuspenseListQueryOptions({
      query: {
        ordering: ordering as
          | 'id'
          | '-id'
          | '-score'
          | '-created_at'
          | 'count_comments'
          | '-count_comments'
          | undefined,
        count: 20,
        page: 1,
        ...query,
      },
    })
  );

  const posts = useMemo(
    () => deduplicate(data?.pages?.flatMap((v) => v.results) ?? [], (v) => v.id),
    [data]
  );

  return (
    <FlatList.Root
      className="cs-posts-section cs-section flex flex-col gap-4"
      isLoading={isFetchingNextPage || isFetchingPreviousPage || isLoading || isFetching}
      content={posts}
    >
      <FlatList.Container className="flex flex-col gap-2">
        <FlatList.EdgeTrigger
          position="top"
          onTrigger={fetchPreviousPage}
          canTrigger={hasPreviousPage && !isFetchingPreviousPage}
        />
        <FlatList.Content>
          {({ item, attributes }) => (
            <PostPreview
              key={item.id}
              post={item}
              {...attributes}
              // @ts-ignore
              withEntityAttachment={query?.target_type !== 'title'}
            />
          )}
        </FlatList.Content>
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={hasNextPage && !isFetchingNextPage}
        />
        <FlatList.Loading count={10}>{renderPostsSkeleton}</FlatList.Loading>
        <FlatList.Empty text="Нет ни одного поста" emoji="🎴" className="rounded-md border" />
      </FlatList.Container>
    </FlatList.Root>
  );
};

export const PostsFilters = () => {
  const { setOrdering, ordering } = usePostQueryStore();

  return (
    <Select onValueChange={(value) => setOrdering(value)} value={ordering}>
      <SelectTrigger className={cn('border-border z-50 w-[150px] border')} withIcon>
        <SelectValue placeholder="Сортировать по" />
      </SelectTrigger>
      <SelectContent className={cn('z-50')}>
        <SelectGroup className="z-50">
          {sortVariantsAlt.map((it) => (
            <SelectItem key={it.value} className="z-50 mb-2" value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export const PostFeedSubject = ({
  query,
  additional2Ordering,
  className,
  ...rest
}: {
  additional2Ordering?: ReactNode;
  query: PostContentProps['query'];
  className?: string;
}) => {
  return (
    <PostQueryProvider>
      <div
        className={cn('cs-posts-section cs-section relative flex flex-col gap-2', className)}
        {...rest}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PostsFilters />
          {additional2Ordering}
        </div>
        <ScrollToTop className="md:bottom-inherit bottom-[120px]" />
        <PostContent query={query} />
        <GlobalImagePreviewAsync />
      </div>
    </PostQueryProvider>
  );
};

export { PostQueryProvider, usePostQueryStore };
