import { cache } from 'react';

import { removeUnusedQueryParams } from '@re/core/lib/query-params';
import { DefaultError, type InfiniteData, isServer, type SkipToken } from '@tanstack/query-core';
import {
  defaultShouldDehydrateQuery,
  Query,
  QueryClient,
  QueryFilters,
  QueryFunction,
  skipToken,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  useSuspenseInfiniteQuery,
  UseSuspenseInfiniteQueryOptions,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';
import SuperJSON from 'superjson';

import type { HTTPRequestConfig } from '~shared/api/$api';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import { client } from '~shared/api/client';
import type { AppQueryKey } from '~shared/types/react-query';
import { noop } from '~shared/utils/noop';

const _queryKeySerializer = <TQueryKey extends AppQueryKey = AppQueryKey>(
  queryKey: TQueryKey
): string => {
  if (typeof queryKey === 'object') {
    if (Array.isArray(queryKey)) return JSON.stringify(queryKey.map(_queryKeySerializer));
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(queryKey).map(([key, value]) => [
          key,
          typeof value === 'number' ? String(value) : value,
        ])
      )
    );
  }

  return JSON.stringify(queryKey);
};

export interface GetKeyOptions<TQueryVariables = Record<string, number | string>> {
  variables: TQueryVariables;
  fetchOptions?: HTTPRequestConfig;
}

export type QueryOverrides<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends AppQueryKey<unknown> = AppQueryKey<unknown>,
> = Partial<Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>> & {};

export type QueryInfiniteOverrides<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends AppQueryKey = AppQueryKey,
> = Partial<
  Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, number>, 'queryKey'>
>;

export const queryKit = {
  createQuery: <
    TQueryVariables = Record<string, NumberIsomorphic>,
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends AppQueryKey<unknown> = AppQueryKey<unknown>,
  >(
    getKey: (
      params: GetKeyOptions<TQueryVariables>
    ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    logicExperiment?: boolean
  ) => ({
    getKey,
    useQuery: (
      params: GetKeyOptions<TQueryVariables> = {} as GetKeyOptions<TQueryVariables>,
      overrides?: QueryOverrides<TQueryFnData, TError, TData, TQueryKey>
    ) => {
      const key = getKey(params);
      const enabled =
        overrides?.enabled === undefined
          ? key.enabled === undefined
            ? true
            : key.enabled
          : overrides.enabled;

      return useQuery({
        ...key,
        ...overrides,
        ...(!logicExperiment
          ? {
              queryFn: key.queryFn,
            }
          : {
              queryFn: (enabled ? key.queryFn : skipToken) as
                | QueryFunction<TQueryFnData, TQueryKey, never>
                | undefined,
              ...(!enabled ? { enabled } : {}),
            }),
      });
    },
  }),
  createInfiniteQuery: <
    TQueryVariables = Record<string, number | string>,
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = InfiniteData<TQueryFnData>,
    TQueryKey extends AppQueryKey = AppQueryKey,
  >(
    getKey: (
      params: GetKeyOptions<TQueryVariables>
    ) => UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, number>,
    logicExperement?: boolean
  ) => ({
    getKey,
    logicExperement,
    useQuery: (
      params: GetKeyOptions<TQueryVariables> = {} as GetKeyOptions<TQueryVariables>,
      overrides?: QueryInfiniteOverrides<TQueryFnData, TError, TData, TQueryKey>
    ) => {
      const key = getKey(params);
      const enabled = overrides?.enabled === undefined ? key.enabled : overrides.enabled;
      // @ts-ignore
      return useInfiniteQuery({
        ...getKey(params),

        // queryKeyHashFn: queryKeySerializer,
        ...overrides,
        ...(!logicExperement
          ? { queryFn: key.queryFn }
          : { queryFn: enabled ? key.queryFn : skipToken }),
        // @ts-ignore
        enabled: logicExperement
          ? (key.enabled && overrides?.enabled === undefined) || overrides?.enabled
          : true,
      });
    },
  }),

  isValidQueryKeyInstance: (queryKey: readonly unknown[] | AppQueryKey) => {
    if (queryKey.length !== 2) return false;
    return typeof queryKey[1] === 'object';
  },
  createQueryKey:
    <P, Q, U extends string = string>(
      func: (variables: EndpointMeta<P, Q>) => AppQueryKey<P, Q, U>
    ) =>
    (variables: EndpointMeta<P, Q>) =>
      // @ts-ignore
      func({
        query: removeUnusedQueryParams(variables?.query || {}) as Q,
        params: removeUnusedQueryParams(variables?.params || {}) as P,
      }),
  createSuspenseQuery: <
    TQueryVariables = Record<string, NumberIsomorphic>,
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends AppQueryKey = AppQueryKey,
  >(
    getKey: (
      params: GetKeyOptions<TQueryVariables>
    ) => UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
  ) => ({
    getKey,
    useQuery: (
      params: Omit<
        GetKeyOptions<TQueryVariables>,
        'enabled'
      > = {} as GetKeyOptions<TQueryVariables>,
      overrides?: Omit<QueryOverrides<TQueryFnData, TError, TData, TQueryKey>, 'enabled'>
    ) => {
      const queryParams = getKey(params);
      // @ts-ignore
      return useSuspenseQuery({
        // @ts-ignore
        ...queryParams,
        // @ts-ignore
        ...overrides,
      });
    },
  }),
  createSuspenseInfiniteQuery: <
    TQueryVariables = Record<string, number | string>,
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = InfiniteData<TQueryFnData>,
    TQueryKey extends AppQueryKey = AppQueryKey,
  >(
    getKey: (
      params: GetKeyOptions<TQueryVariables>
    ) => UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, number>
  ) => ({
    getKey,
    useQuery: (
      params: GetKeyOptions<TQueryVariables> = {} as GetKeyOptions<TQueryVariables>,
      overrides?: QueryInfiniteOverrides<TQueryFnData, TError, TData, TQueryKey>
    ) =>
      // @ts-ignore
      useSuspenseInfiniteQuery({
        ...getKey(params),
        // queryKeyHashFn: queryKeySerializer,
        ...overrides,
      }),
  }),
};

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        experimental_prefetchInRender: true,
        structuralSharing: true,
        staleTime: 30 * 1000,
        gcTime: 5 * 1000,
        retry: false,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        shouldRedactErrors: (error) => {
          return false;
        },
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
}

let clientQueryClientSingleton: QueryClient | undefined = undefined;

export const getQueryClient = cache(() => {
  if (isServer) {
    return makeQueryClient();
  }

  return (clientQueryClientSingleton ??= makeQueryClient());
});

export const queryClient = getQueryClient();

export const resolveInvalidate = (invalidate: Invalidate, query: Query) => {
  if (typeof invalidate === 'function') return invalidate(query);

  const isSingleKey = invalidate!.every((key) => !Array.isArray(key));

  if (isSingleKey) {
    const [uniq, extra] = invalidate as AppQueryKey;
    const [uniq1, extra1] = query.queryKey as AppQueryKey;

    if (uniq !== uniq1) return false;

    const newInv = {
      ...extra,
      query: { ...extra?.query, ...extra1?.query },
      params: { ...extra?.params, ...extra1?.params },
    } satisfies AppQueryKey[1];

    return JSON.stringify(newInv) === JSON.stringify(extra);
  }

  return invalidate!.some((key) => JSON.stringify(key) === JSON.stringify(query.queryKey));
};

export const resolveInvalidateV2 = (invalidate: InvalidateV2, query: Query) => {
  if (typeof invalidate === 'function') return invalidate(query);

  if (Array.isArray(invalidate) && typeof invalidate[0] === 'object' && '_id' in invalidate[0]) {
    if (typeof query.queryKey[0] !== 'object') return false;
    return invalidate[0]._id === query.queryKey[0]._id;
  }

  return false;
};

export const mergeInvalidates =
  (invalidate: Invalidate, newInvalidate?: Invalidate) => (query: Query) => {
    if (!invalidate) throw 'invalidate must be an object';
    if (!newInvalidate) return resolveInvalidate(invalidate, query);

    const invalidateValue = resolveInvalidate(invalidate, query);
    const newInvalidateValue = resolveInvalidate(newInvalidate, query);

    return invalidateValue || newInvalidateValue;
  };

export type Invalidate = AppQueryKey | AppQueryKey[] | QueryFilters['predicate'];

export type InvalidateV2 = { _id: string }[] | QueryFilters['predicate'];

export type OptimisticMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  invalidate?: Invalidate;
};

export const customSkipToken = new Promise<void>(noop) as unknown as SkipToken;

export const useOptimisticMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: OptimisticMutationOptions<TData, TError, TVariables, TContext> & {
    customInvalidate?: boolean;
    invalidateV2?: InvalidateV2;
  },
  client: QueryClient = queryClient
): UseMutationResult<TData, TError, TVariables, TContext> =>
  useMutation({
    ...options,
    onSuccess: async (data, error, context) => {
      await options.onSuccess?.(data, error, context);
      // if (options.customInvalidate) return;
      if (options.invalidate) {
        await client.invalidateQueries({
          // exact: true,
          predicate: (query) => resolveInvalidate(options.invalidate, query),
        });
      }
      if (options.invalidateV2) {
        await client.invalidateQueries({
          predicate: (query) => resolveInvalidateV2(options.invalidateV2, query),
        });
      }
    },
  });
export const withClientOptions = <
  T extends (Record<string, unknown> & { client?: typeof client }) | undefined,
>(
  options: T
) => {
  return { ...options, client };
};
