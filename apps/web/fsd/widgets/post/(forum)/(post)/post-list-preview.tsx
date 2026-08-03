'use client';
import { useSearchParams } from 'next/navigation';

import { isServer } from '@tanstack/query-core';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';

import { useForumTags } from '~entities/post/model/contexts';
import { getPostsFeedPaginatedSuspenseListQueryOptions } from '~entities/post/model/queries';
import { renderPostsSkeleton } from '~entities/post/ui/post-skeletons-list';
import { CleanObjectPost } from '~features/(post)/clean-object-post';
import { usePostsListSearchQuery } from '~features/(post)/search-bar/model/hooks/use-posts-list-search-query';
import type { OrderingSorts } from '~shared/api/models/post';
import { FlatList } from '~shared/ui/flat-list-v2';
import { deduplicate } from '~shared/utils/record-deduplicator';
import { PostPreview } from '~widgets/post/(forum)/(post)/post-preview';
import { CreateButton } from '~widgets/post/layout/create-button';

export const PostListPreview = () => {
  const [search] = usePostsListSearchQuery();
  const searchParams = useSearchParams();
  const ordering = (searchParams.get('ordering') as OrderingSorts) ?? '-id';
  const title_id = searchParams.get('title');

  const includes = useForumTags((v) => v.includes);
  const excludes = useForumTags((v) => v.excludes);

  const tags = Array.from(includes);
  const exclude_tag = Array.from(excludes);
  const { data, isFetchingNextPage, hasNextPage, isLoading, isFetching, fetchNextPage } =
    useApiGenSuspenseInfiniteQuery(
      getPostsFeedPaginatedSuspenseListQueryOptions(
        {
          clientOrdering: ordering,
          query: {
            title_id: title_id ? Number(title_id) : undefined,
            ordering: '-id',
            count: 20,
            page: 1,
            search,
            tags,
            exclude_tag,
          },
          cache: 'no-store',
        },
        // @ts-ignore
        { placeholderData: isServer ? undefined : [] }
      )
    );

  const pages = data?.pages || [];
  const finalPosts = deduplicate(
    pages.flatMap((v) => v.results),
    (it) => it.id
  );

  return (
    <div className="post-content sticky-container relative min-h-screen w-full">
      {finalPosts[0] && <CleanObjectPost firstPost={finalPosts[0]} />}
      <FlatList.Root
        className="flex min-h-screen flex-col gap-2"
        isLoading={isFetchingNextPage || isFetching}
        content={finalPosts}
      >
        <FlatList.Content>
          {({ item, attributes }) => <PostPreview key={item.id} post={item} {...attributes} />}
        </FlatList.Content>
        <FlatList.Loading count={10}>{renderPostsSkeleton}</FlatList.Loading>
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={hasNextPage && !isFetchingNextPage && !isLoading && !isFetching}
        />
        <FlatList.Empty text="Пусто" emoji="🎴" />
      </FlatList.Root>
      <CreateButton />
    </div>
  );
};
