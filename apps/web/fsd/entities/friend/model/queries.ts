import { keepPreviousData } from '@tanstack/react-query';

import { FriendQueryKeys } from '~entities/friend/model/query-keys';
import { FriendRepository } from '~entities/friend/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  FriendRequestPaginatedListParamsSchema,
  FriendRequestPaginatedListQuerySchema,
  FriendRequestPaginatedListResponseSchema,
  FriendSearchPaginatedListResponseSchema,
  FriendshipPaginatedListParamsSchema,
  FriendshipPaginatedListQuerySchema,
  FriendShipPaginatedListResponseSchema,
  FriendshipSearchPaginatedListQuerySchema,
} from '~shared/api/models/friend';
import { queryKit } from '~shared/api/react-query';
import { defaultNextParam } from '~shared/lib/react-query/default-next-param';

export const { useQuery: useFriendsPaginatedListQuery, getKey: getFriendsPaginatedListQuery } =
  queryKit.createInfiniteQuery<
    EndpointMeta<FriendshipPaginatedListParamsSchema, FriendshipPaginatedListQuerySchema>,
    FriendShipPaginatedListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: FriendQueryKeys.Friendship.list(variables),
    initialPageParam: variables?.query?.page ?? 1,
    placeholderData: keepPreviousData,

    staleTime: Infinity,
    queryFn: async ({ pageParam }) =>
      FriendRepository.friendshipList(
        {
          ...variables,

          query: {
            ...variables.query,
            count: variables?.query?.count ?? 20,
            page: pageParam,
          },
        },
        fetchOptions
      ),

    getNextPageParam: defaultNextParam,
  }));

export const {
  useQuery: useSuspenseFriendsPaginatedListQuery,
  getKey: getSuspenseFriendsPaginatedListQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<FriendshipPaginatedListParamsSchema, FriendshipPaginatedListQuerySchema>,
  FriendShipPaginatedListResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: FriendQueryKeys.Friendship.list(variables),
  initialPageParam: variables?.query?.page ?? 1,
  placeholderData: keepPreviousData,

  staleTime: Infinity,
  queryFn: async ({ pageParam }) =>
    FriendRepository.friendshipList(
      {
        ...variables,

        query: {
          ...variables.query,
          count: variables?.query?.count ?? 20,
          page: pageParam,
        },
      },
      fetchOptions
    ),

  getNextPageParam: defaultNextParam,
}));

export const {
  useQuery: useSuspenseFriendsSearchPaginatedListQuery,
  getKey: getSuspenseFriendsSearchPaginatedListQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<void, FriendshipSearchPaginatedListQuerySchema>,
  FriendSearchPaginatedListResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: FriendQueryKeys.Friendship.search(variables),
  initialPageParam: variables?.query?.page ?? 1,
  placeholderData: keepPreviousData,
  staleTime: Infinity,
  queryFn: async ({ pageParam }) =>
    FriendRepository.friendshipSearchList(
      {
        ...variables,
        query: {
          ...variables.query,
          count: variables?.query?.count ?? 20,
          page: pageParam,
        },
      },
      fetchOptions
    ),

  getNextPageParam: defaultNextParam,
}));

export const {
  useQuery: useSuspenseFriendsRequestsPaginatedListQuery,
  getKey: getSuspenseFriendsRequestsPaginatedListQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<FriendRequestPaginatedListParamsSchema, FriendRequestPaginatedListQuerySchema>,
  FriendRequestPaginatedListResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: FriendQueryKeys.FriendRequest.list(variables),
  initialPageParam: variables?.query?.page ?? 1,
  placeholderData: keepPreviousData,
  staleTime: Infinity,
  queryFn: async ({ pageParam }) =>
    FriendRepository.friendRequestsList(
      {
        ...variables,
        query: {
          ...variables.query,
          count: variables?.query?.count ?? 20,
          page: pageParam,
        },
      },
      fetchOptions
    ),
  getNextPageParam: defaultNextParam,
}));
