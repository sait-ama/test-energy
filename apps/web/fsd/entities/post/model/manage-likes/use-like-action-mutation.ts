import type { InfiniteData } from '@tanstack/query-core';
import { useMutation } from '@tanstack/react-query';

import {
  activityVotePostCreateMutation,
  v2ForumReactionsRetrieveInfiniteQueryKey,
} from '@re/api/generated/@tanstack/react-query.gen';

import { getOptimisticPostPaginatedListUpdate } from '~entities/post/model/mutations';
import { Post } from '~entities/post/ui/post-card';
import { client } from '~shared/api/client';
import { ActivityVotePostCreateData } from '~shared/api/generated/models';
import { RatedStatus } from '~shared/api/models/common';
import { PostReactionsByDirPaginatedListResponseSchema } from '~shared/api/models/post';
import { getQueryClient } from '~shared/api/react-query';
import { getInitialState, likeDislikeReducer } from '~shared/lib/like-dislike/model/store';
import { useSession } from '~shared/lib/session/use-session';

export const useLikePostActionMutation = () => {
  const session = useSession()!;
  const dir = Post.useContext((v) => v.post.dir);
  const postId = Post.useContext((v) => v.post.id);
  return useMutation({
    ...activityVotePostCreateMutation({ client }),
    onSuccess: ({ results: { rated } }) => {
      getQueryClient().setQueriesData<InfiniteData<PostReactionsByDirPaginatedListResponseSchema>>(
        {
          predicate: (query) => {
            const [{ _id: curId, path: curPath } = {}] = query.queryKey as ReturnType<
              typeof v2ForumReactionsRetrieveInfiniteQueryKey
            >;
            const [{ _id: targetId }] = v2ForumReactionsRetrieveInfiniteQueryKey({ path: { dir } });
            return targetId === curId && dir === curPath?.dir;
          },
          type: 'all',
          fetchStatus: 'idle',
        },
        (curData) => {
          if (!curData) return curData;

          if (rated === null) {
            return {
              pages: curData.pages.map((page) => ({
                ...page,
                results: page.results.filter((res) => res.user.id !== session.id),
              })),
              pageParams: curData.pageParams,
            };
          }

          let userReaction: (typeof curData.pages)[0]['results'][0] | null = null;
          const filteredPages = curData.pages.map((page) => {
            const newResults = [];
            for (const res of page.results) {
              if (res.user.id === session.id) {
                userReaction = { ...res, type: rated };
              } else {
                newResults.push(res);
              }
            }
            return { ...page, results: newResults };
          });

          if (!userReaction) {
            userReaction = {
              id: Number(Date.now()),
              user: { ...session },
              type: rated,
            };
          }

          const updatedPages = filteredPages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                results: [userReaction!, ...page.results],
              };
            }
            return page;
          });

          return {
            pages: updatedPages,
            pageParams: curData.pageParams,
          };
        }
      );
    },
    onMutate: async ({ body: { type } }: ActivityVotePostCreateData) => {
      await getOptimisticPostPaginatedListUpdate({
        localUpdate: () => {},
        postId,
        postDir: dir,
        updater: (post) => {
          const newState = likeDislikeReducer(getInitialState(post.rated, post.score), {
            type,
          });
          return {
            ...post,
            score: newState.score,
            rated: newState.liked
              ? RatedStatus.LIKED
              : newState.disliked
                ? RatedStatus.DISLIKED
                : null,
          };
        },
      })();
    },
  });
};
