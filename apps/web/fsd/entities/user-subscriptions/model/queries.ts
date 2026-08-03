import type { DefaultError } from '@tanstack/query-core';
import type { QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import {
  useSubscriptionsPaginatedListQueryParams,
  useUserFollowersPaginatedListQueryParams,
} from '~entities/user-subscriptions/model/hooks';
import { UserSubscriptionRepository } from '~entities/user-subscriptions/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  FollowersPaginatedListQuerySchema,
  FollowersPaginatedListResponseSchema,
} from '~shared/api/models/follower';
import type {
  SubContentType,
  UserSubscriptionsPaginatedListQuerySchema,
  UserSubscriptionsPaginatedListResponseSchema,
} from '~shared/api/models/user-subscriptions';
import { queryKit } from '~shared/api/react-query';
import { defaultNextParam, defaultPreviousParam } from '~shared/lib/react-query/default-next-param';

import { UserSubscriptionQueryKey } from './query-keys';

export const {
  getKey: getUserSubscriptionsPaginatedListQueryKey,
  useQuery: useSuspenseUserSubscriptionPaginatedListQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<void, UserSubscriptionsPaginatedListQuerySchema>,
  UserSubscriptionsPaginatedListResponseSchema
>(({ variables, fetchOptions }) => {
  const { count = 20, page = 1, ...other } = variables.query!;
  return {
    queryFn: ({ pageParam }) =>
      UserSubscriptionRepository.Subscriptions.list(
        {
          query: {
            count,
            page: pageParam,
            ...other,
          },
        },
        fetchOptions
      ),
    enabled: !!(other && other.sub_type && other.user_id),
    getNextPageParam: defaultNextParam,
    getPreviousPageParam: defaultPreviousParam,
    queryKey: UserSubscriptionQueryKey.Subscriptions.list({ query: { count, page, ...other } }),
    initialPageParam: page ?? 1,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  };
});
export const useUserPaginatedListQuery = ({
  variables,
}: {
  variables: EndpointMeta<void, UserSubscriptionsPaginatedListQuerySchema>;
}) => useInfiniteQuery(getUserSubscriptionsPaginatedListQueryKey({ variables }));

export const getUserSubscriptionsPaginatedListQuery = ({
  count = 20,
  page = 1,
  ...other
}: UserSubscriptionsPaginatedListQuerySchema) =>
  ({
    enabled: !!(other.user_id && other.sub_type),
    queryKey: UserSubscriptionQueryKey.Subscriptions.list({ query: { count, page, ...other } }),
    queryFn: ({ pageParam }) =>
      UserSubscriptionRepository.Subscriptions.list({
        query: {
          count,
          page: pageParam,
          ...other,
        },
      }),
    getNextPageParam: defaultNextParam,
    initialPageParam: page,

    placeholderData: keepPreviousData,
  }) satisfies UseInfiniteQueryOptions<
    UserSubscriptionsPaginatedListResponseSchema,
    DefaultError,
    UserSubscriptionsPaginatedListQuerySchema,
    UserSubscriptionsPaginatedListResponseSchema,
    QueryKey,
    number
  >;

export const {
  getKey: getFollowersPaginatedListQueryKey,
  useQuery: useSuspenseFollowersPaginatedListQuery,
} = queryKit.createInfiniteQuery<
  EndpointMeta<void, FollowersPaginatedListQuerySchema>,
  FollowersPaginatedListResponseSchema
>(({ variables, fetchOptions }) => {
  const { count = 20, page = 1, ...other } = variables.query!;
  return {
    queryFn: ({ pageParam }) =>
      UserSubscriptionRepository.Followers.list(
        {
          query: {
            count,
            page: pageParam,
            ...other,
          },
        },
        fetchOptions
      ),

    enabled: !!(other && other.sub_type && other.id),
    getNextPageParam: defaultNextParam,
    getPreviousPageParam: defaultPreviousParam,
    queryKey: UserSubscriptionQueryKey.Followers.list({ query: { count, page, ...other } }),
    initialPageParam: page ?? 1,
    staleTime: Infinity,
  };
});

export const useFollowersPaginatedListQuery = (defaultSubType: SubContentType) => {
  const query = useUserFollowersPaginatedListQueryParams(defaultSubType);
  return useInfiniteQuery(getFollowersPaginatedListQueryKey({ variables: { query } }));
};
export const useUserSubscriptionsPaginatedListQuery = () => {
  const params = useSubscriptionsPaginatedListQueryParams();
  return useInfiniteQuery(
    getUserSubscriptionsPaginatedListQuery({ count: 20, page: 1, ...params })
  );
};
