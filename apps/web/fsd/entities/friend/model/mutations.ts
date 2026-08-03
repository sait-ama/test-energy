import type { InfiniteData } from '@tanstack/query-core';
import type { QueryKey } from '@tanstack/react-query';
import { queryOptions } from '@tanstack/react-query';

import { FriendQueryKeys } from '~entities/friend/model/query-keys';
import { FriendRepository } from '~entities/friend/model/repository';
import type {
  FriendshipPaginatedListParamsSchema,
  FriendShipPaginatedListResponseSchema,
} from '~shared/api/models/friend';
import { getQueryClient, queryKit } from '~shared/api/react-query';

export const removeFriend = ({ friendId, userId }: { friendId: number; userId: number }) =>
  queryOptions<void, void, void, QueryKey>({
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    // @ts-ignore
    queryKey: queryKit.createQueryKey(() => [
      '$mutation-remove-friend',
      { authDepend: true, params: { friendId, userId } },
    ]),
    queryFn: () =>
      FriendRepository.removeFriendship({
        params: {
          userId,
          friendId,
        },
      }),
  });

export const removeFriendFromFriendShipLocally = (whoId: number, friendId) => {
  getQueryClient().setQueriesData<InfiniteData<FriendShipPaginatedListResponseSchema>>(
    {
      predicate: ({ queryKey }) => {
        if (!queryKit.isValidQueryKeyInstance(queryKey)) return false;
        const key = queryKey as QueryKey<unknown>;
        const [primary, extra] = key;
        const typedExtra = extra as QueryKey<FriendshipPaginatedListParamsSchema>[1];
        return (
          typedExtra?.params?.userId == whoId && primary === FriendQueryKeys.Friendship.UniquePart
        );
      },
    },
    (d) => {
      if (!d) return d;
      return {
        ...d,
        pages: d?.pages.map((v) => ({
          ...v,
          results: v.results.filter((v) => v.id != friendId),
        })),
      };
    }
  );
};
