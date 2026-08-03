import type { Dispatch, SetStateAction } from 'react';

import type { InfiniteData } from '@tanstack/query-core';

import {
  v2ForumRetrieve2QueryKey,
  v2ForumRetrieveInfiniteQueryKey,
  v2ForumSearchRetrieveInfiniteQueryKey,
} from '@re/api/generated/@tanstack/react-query.gen';

import type { PostFeedPaginatedListResponseSchema, PostSchema } from '~shared/api/models/post';
import { getQueryClient } from '~shared/api/react-query';

export const getOptimisticPostPaginatedListUpdate =
  ({
    localUpdate,
    postDir,
    postId,
    updater,
  }: {
    localUpdate: Dispatch<SetStateAction<PostSchema>>;
    postDir: string;
    postId: number;
    updater: (post: PostSchema) => Partial<PostSchema>;
  }) =>
  async () => {
    getQueryClient().setQueryData<PostSchema>(
      v2ForumRetrieve2QueryKey({ path: { dir: postDir } }),
      (v: PostSchema) => (!v ? v : { ...v, ...updater(v) })
    );
    getQueryClient().setQueriesData<InfiniteData<PostFeedPaginatedListResponseSchema>>(
      {
        predicate: (query) => {
          const [{ _id: targetId }] = v2ForumSearchRetrieveInfiniteQueryKey({ query: {} });
          const [{ _id: targetSubjectId }] = v2ForumRetrieveInfiniteQueryKey({ query: {} });
          const [{ _id: currentId, query: currentQuery } = {}] = query.queryKey as ReturnType<
            typeof v2ForumSearchRetrieveInfiniteQueryKey
          >;
          if (targetId !== currentId && targetSubjectId !== currentId) return false;
          if (query.isActive()) {
            localUpdate((p) => ({ ...p, ...updater(p) }));
            return false;
          }
          return !!(!query.isActive() || currentQuery?.week);
        },
        type: 'all',
      },
      (curData) => {
        if (!curData) return curData;
        return {
          ...curData,
          pages: curData?.pages.map((page) => ({
            ...page,
            results: page.results.map((post) =>
              post.id === postId ? { ...post, ...updater(post) } : post
            ),
          })),
        };
      }
    );
  };
