import {
  DefaultError,
  InfiniteData,
  useQuery,
  UseQueryOptions,
  useSuspenseInfiniteQuery,
  UseSuspenseInfiniteQueryOptions,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';

import {
  useSuspenseFriendsPaginatedListQuery,
  useSuspenseFriendsSearchPaginatedListQuery,
} from '~entities/friend/model/queries';
import type { EndpointMeta, ToolkitApiOptions } from '~shared/api/api-toolkit';
import { defaultNextParam, defaultPreviousParam } from '~shared/lib/react-query/default-next-param';
import { useSession } from '~shared/lib/session/use-session';

import { ChannelSchema } from '../types';

import { ChatQueryKeys } from './query-key';
import { ChatRepository } from './repository';
import {
  ChannelByIdParamsSchema,
  ChannelPaginatedListResponseSchema,
  GetChannelsPaginatedListQuerySchema,
} from './types';

export const getChannelListQueryKey = (
  variables: EndpointMeta<void, GetChannelsPaginatedListQuerySchema>
) => ChatQueryKeys.Channel.List.get(variables);

export const useChannelsListSuspenseQuery = ({
  variables,
  options,
}: {
  variables: EndpointMeta<void, GetChannelsPaginatedListQuerySchema>;
  options?: Partial<UseSuspenseQueryOptions<ChannelSchema[], DefaultError>> & {
    fetchOptions?: ToolkitApiOptions;
  };
}) => {
  return useSuspenseQuery<ChannelSchema[], DefaultError>({
    queryKey: getChannelListQueryKey(variables),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    ...options,
    queryFn: async () => {
      // The response is now already serialized by the repository
      return await ChatRepository.Channel.list({
        ...variables,
        query: {
          ...variables.query,
          name: variables.query?.query || '',
        },
      });
    },
  });
};

export const getChannelsPaginatedListQueryKey = (
  variables: EndpointMeta<void, GetChannelsPaginatedListQuerySchema>
) => ChatQueryKeys.Channel.List.get(variables);

export const useChannelsPaginatedListSuspenseQuery = ({
  variables,
  options,
}: {
  variables: EndpointMeta<void, GetChannelsPaginatedListQuerySchema>;
  options?: UseSuspenseInfiniteQueryOptions<
    ChannelPaginatedListResponseSchema,
    DefaultError,
    InfiniteData<ChannelPaginatedListResponseSchema>,
    any,
    ReturnType<typeof getChannelsPaginatedListQueryKey>,
    number
  >;
}) => {
  return useSuspenseInfiniteQuery<
    ChannelPaginatedListResponseSchema,
    DefaultError,
    InfiniteData<ChannelPaginatedListResponseSchema>,
    ReturnType<typeof getChannelsPaginatedListQueryKey>,
    number
  >({
    queryKey: getChannelsPaginatedListQueryKey(variables),
    initialPageParam: variables.query?.page ?? 1,
    // placeholderData: keepPreviousData,
    ...options,
    queryFn: async ({ pageParam }) => {
      // The response is now already serialized by the repository
      return await ChatRepository.Channel.list({
        ...variables,
        query: {
          ...variables.query,
          name: variables.query?.query || '',
          page: pageParam,
          count: variables.query?.count || 20,
        },
      });
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    getNextPageParam: defaultNextParam,
    getPreviousPageParam: defaultPreviousParam,
  });
};

export const getChannelByIdQueryKey = (
  variables: EndpointMeta<Partial<ChannelByIdParamsSchema>, void>
) => ChatQueryKeys.Channel.ById.get(variables);

export const useChannelByIdQuery = ({
  variables,
  options = undefined,
}: {
  variables: EndpointMeta<Partial<ChannelByIdParamsSchema>, void>;
  options?: Partial<UseQueryOptions<ChannelSchema, DefaultError>> & {
    fetchOptions?: ToolkitApiOptions;
  };
}) => {
  return useQuery<ChannelSchema, DefaultError>({
    queryKey: getChannelByIdQueryKey(variables),
    ...options,
    queryFn: async () => {
      // if (!variables.params?.channelId) {
      //   throw new Error('Channel ID is required');
      // }
      return await ChatRepository.Channel.byId(
        {
          ...variables,
          params: {
            channelId: variables.params?.channelId!,
          },
        },
        options?.fetchOptions
      );
    },
    enabled: !!variables.params?.channelId && options?.enabled !== false,
  });
};

export const useChannelByIdSuspenseQuery = ({
  variables,
  options = undefined,
}: {
  variables: EndpointMeta<Partial<ChannelByIdParamsSchema>, void>;
  options?: Partial<UseQueryOptions<ChannelSchema, DefaultError>> & {
    // fetchOptions?: ToolkitApiOptions;
  };
}) => {
  return useSuspenseQuery<ChannelSchema, DefaultError>({
    queryKey: getChannelByIdQueryKey(variables),
    ...options,
    queryFn: async () => {
      if (!variables.params?.channelId) {
        throw new Error('Channel ID is required');
      }
      return await ChatRepository.Channel.byId(
        {
          ...variables,
          params: {
            channelId: variables.params.channelId,
          },
        }
        // options?.fetchOptions
      );
    },
    // enabled: !!variables.params?.channelId && options?.enabled !== false,
  });
};

export const useSuspenseSearchFriendsPaginatedQuery = ({
  searchQuery,
}: {
  searchQuery?: string;
}) => {
  return useSuspenseFriendsSearchPaginatedListQuery(
    {
      variables: {
        // params: { userId: user.id },
        query: {
          count: 20,
          query: searchQuery || '',
        },
      },
    },
    {
      enabled: !!searchQuery,
      throwOnError: false,
    }
  );
};

export const useSuspenseTopPeersPaginatedQuery = () => {
  const user = useSession()!;

  return useSuspenseFriendsPaginatedListQuery(
    {
      variables: {
        params: { userId: user.id },
        query: { count: 10 },
      },
    },
    {
      enabled: !!user?.id,
    }
  );
};
