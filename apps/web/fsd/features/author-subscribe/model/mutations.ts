import { useParams, useSearchParams } from 'next/navigation';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';
import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { PublisherRepository } from '~entities/publisher/model/repository';
import { UserKeys } from '~entities/user/model/query-keys';
import { UserSubscriptionQueryKey } from '~entities/user-subscriptions/model/query-keys';
import { UserSubscriptionRepository } from '~entities/user-subscriptions/model/repository';
import type {
  FollowerOrdering,
  FollowersPaginatedListResponseSchema,
} from '~shared/api/models/follower';
import type {
  SubContentType,
  UpdateSubscriptionResponseSchema,
} from '~shared/api/models/user-subscriptions';
import { customSkipToken, getQueryClient, useOptimisticMutation } from '~shared/api/react-query';
import { useSession } from '~shared/lib/session/use-session';

export const useCurrentUserFollowUserMutation = (defaultId?: string) => {
  const params = useParams();
  const id = params.id || defaultId;
  return useOptimisticMutation<
    UpdateSubscriptionResponseSchema,
    DefaultError,
    { operation: 'add' | 'remove' },
    {
      oldCount: number;
    }
  >({
    invalidate: [UserKeys.detailById({ params: { userId: String(id!) } })],
    // UserSubscriptionQueryKey.Followers.list({ query: { page: 1, sub_type: 'author_users', count: 20, id: Number(id), ordering: '-id' } }),
    mutationFn: ({ operation }) =>
      UserSubscriptionRepository.Subscriptions.changeSubs({
        data: {
          operation,
          author_users: Array.isArray(id) ? id : [Number(id)],
        },
      }),
  });
};
export const useExitFromCurrentPublisher = () => {
  const { data: { content: { id, dir = '' } = {} } = {} } = useCurrentPublisher();
  return useOptimisticMutation({
    invalidate: [PublisherQueryKey.getPublisherByDir({ params: { dir } })],
    mutationFn: () => (!id ? customSkipToken : PublisherRepository.exit({ params: { id } })),
  });
};
export const useUserFollowersOptimisticMutation = (id: NumberIsomorphic) => {
  const curUser = useSession();

  return (op: 'add' | 'remove') => {
    if (!curUser) return;
    getQueryClient().setQueryData<InfiniteData<FollowersPaginatedListResponseSchema>>(
      UserSubscriptionQueryKey.Followers.list({
        query: {
          count: 20,
          page: 1,
          sub_type: 'author_users',
          id: Number(id),
          ordering: '-id',
        },
      }),
      // @ts-ignore
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          // @ts-ignore
          pages: oldData?.pages.map((page, index) => {
            if (index === 0) {
              if (op === 'add') {
                return {
                  ...page,
                  results: [
                    {
                      id: curUser.id,
                      avatar: curUser.avatar,
                      username: curUser.username,
                    },
                    ...(page.results || []),
                  ],
                };
              } else if (op === 'remove') {
                return {
                  ...page,
                  results: page.results.filter((follower) => follower.id !== curUser.id),
                };
              }
              return page;
            }
            return page;
          }),
        };
      }
    );
  };
};
export const usePublisherFollowMutation = (id: NumberIsomorphic) => {
  const curUser = useSession();
  const srarch = useSearchParams();
  const ordering = (srarch.get('ordering') as FollowerOrdering) ?? '-id';
  return (op: 'add' | 'remove', sub_type: SubContentType) => {
    if (!curUser) return;
    getQueryClient().setQueryData<InfiniteData<FollowersPaginatedListResponseSchema>>(
      UserSubscriptionQueryKey.Followers.list({
        query: {
          count: 20,
          page: 1,
          sub_type: sub_type,
          id: Number(id),
          ordering,
        },
      }),
      // @ts-ignore
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          // @ts-ignore
          pages: oldData?.pages.map((page, index) => {
            if (index === 0) {
              if (op === 'add') {
                return {
                  ...page,
                  results: [
                    {
                      id: curUser.id,
                      avatar: curUser.avatar,
                      username: curUser.username,
                    },
                    ...(page.results || []),
                  ],
                };
              } else if (op === 'remove') {
                return {
                  ...page,
                  results: page.results.filter((follower) => follower.id !== curUser.id),
                };
              }
              return page;
            }
            return page;
          }),
        };
      }
    );
  };
};
