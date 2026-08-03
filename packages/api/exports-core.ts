//for reusable layer
import { SkipToken } from '@tanstack/query-core';
import {
  AnyUseQueryOptions,
  InfiniteData,
  infiniteQueryOptions,
  queryOptions,
  skipToken,
  UseInfiniteQueryOptions,
  useSuspenseInfiniteQuery,
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';
import { UndefinedInitialDataInfiniteOptions } from '@tanstack/react-query/src/infiniteQueryOptions';

import { QueryKey } from './generated/@tanstack/react-query.gen';
import { Client, TDataShape } from './generated/client';
import { client as _heyApiClient } from './generated/client.gen';
import type { Options } from './generated/sdk.gen';

export const createQueryKey = <TOptions extends Options>(
  id: string,
  options?: TOptions,
  infinite?: boolean
): [QueryKey<TOptions>[0]] => {
  const params: QueryKey<TOptions>[0] = {
    _id: id,
    baseUrl: (options?.client ?? _heyApiClient).getConfig().baseUrl,
  } as QueryKey<TOptions>[0];
  if (infinite) {
    params._infinite = infinite;
  }
  if (options?.body) {
    params.body = options.body;
  }
  if (options?.headers) {
    params.headers = options.headers;
  }
  if (options?.path) {
    params.path = options.path;
  }
  if (options?.query) {
    params.query = options.query;
  }
  return [params];
};

export interface MinimalPaginationResponse {
  next: string | null;
  previous: string | null;
}

export const getV1NextParam = <
  TPageParam extends number,
  TQueryFnData extends MinimalPaginationResponse,
>(
  lastPage: TQueryFnData,
  _allPages: TQueryFnData[],
  lastPageParam: TPageParam,
  _allPageParams: TPageParam[]
) => {
  if (!lastPage.next) return null;

  return lastPageParam + 1;
};
export const getV1PreviousParam = <
  TPageParam extends number,
  TQueryFnData extends MinimalPaginationResponse,
>(
  firstPage: TQueryFnData,
  // @ts-ignore
  _,
  firstPageParam: TPageParam
) => {
  if (!firstPage.previous) return null;
  if (firstPageParam - 1 <= 0) return null;

  return firstPageParam - 1;
};

export const getV2NextPageParam = <TQueryFnData extends MinimalPaginationResponse, TPageParam>(
  lastPage: TQueryFnData,
  _: unknown,
  lastPageParam: TPageParam
) => {
  if (!lastPage?.next) return null;
  if (typeof lastPageParam !== 'number') return null;
  return lastPageParam + 1;
};
export const getV2PreviousPageParam = <TQueryFnData extends MinimalPaginationResponse>(
  lastPage: TQueryFnData,
  _: unknown,
  lastPageParam: number
) => {
  if (!lastPage?.previous) return null;
  if (typeof lastPageParam !== 'number') return null;
  return lastPageParam - 1;
};
//for suspense infinite query!
export function useApiGenSuspenseInfiniteQuery<
  TQueryFnData,
  TError = unknown,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends readonly unknown[] = readonly unknown[],
  TPageParam = number,
>({
  pagination = 'v2',
  initialPageParam,
  getNextPageParam,
  getPreviousPageParam,
  ...options
}: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
  pagination?: 'v2' | 'v1';
}) {
  const paginationParams = {
    initialPageParam: initialPageParam || 1,
    getNextPageParam:
      getNextPageParam || (pagination === 'v2' ? getV2NextPageParam : getV1NextParam),
    getPreviousPageParam:
      getPreviousPageParam || (pagination === 'v2' ? getV2PreviousPageParam : getV1PreviousParam),
    ...options,
  };
  return useSuspenseInfiniteQuery<TQueryFnData, TError, TData, TQueryKey, TPageParam>(
    // @ts-ignore
    paginationParams
  );
}

/**
 * Suspense-flavored identity helpers for options typing parity with React Query hooks.
 */
export function querySuspenseOptions<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(options: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return options;
}

export function querySuspenseInfiniteOptions<
  TQueryFnData,
  TError = unknown,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends readonly unknown[] = readonly unknown[],
  TPageParam = number,
>(
  options:
    | UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
    | UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
) {
  return options as UseSuspenseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >;
}

type Params<Api extends Options<TDataShape>, S extends boolean> = {
  api: Api;
  query?: Partial<
    Parameters<S extends true ? typeof querySuspenseOptions : typeof queryOptions>[0]
  >;
  suspense?: S;
};
type QueryParams<S extends boolean> = Parameters<
  S extends true ? typeof querySuspenseInfiniteOptions : typeof infiniteQueryOptions
>[0];

type ParamsInfinite<Api, S extends boolean> = {
  api: Api;
  query?: Partial<QueryParams<S>>;
  suspense?: S;
};
export const customSkipToken = new Promise<void>(() => {}) as unknown as SkipToken;
type GetOptionsFnRequired<
  Shape extends TDataShape,
  O extends Options<Shape>,
  R extends AnyUseQueryOptions,
> = (options: O) => R;
type GetOptionsFn<
  Shape extends TDataShape,
  O extends Options<Shape>,
  R extends AnyUseQueryOptions,
> = (options?: O) => R;
export const createQueryGenerated =
  ({ client }: { client: Client }) =>
  <Shape extends TDataShape, O extends Options<Shape>, R extends AnyUseQueryOptions>(
    getOptions: GetOptionsFnRequired<Shape, O, R> | GetOptionsFn<Shape, O, R>,
    initialQueryOptions?:
      | Partial<QueryParams<false>>
      | ((params: Omit<ParamsInfinite<O, false>, 'suspense'>) => Partial<QueryParams<false>>)
  ) => {
    return <S extends boolean>({
      api,
      query: { queryFn: _qF, ...restQuery } = {},
      suspense,
    }: Params<O, S>) => {
      api.client = api?.client ?? client;

      const generated = getOptions(api);
      const overrides =
        typeof initialQueryOptions === 'function'
          ? initialQueryOptions({
              api,
              // @ts-expect-error
              query: { ...restQuery, queryFn: generated?.queryFn },
            })
          : initialQueryOptions;
      const options = {
        ...generated,
        ...restQuery,
        ...(overrides ?? {}),
      } as const;
      // @ts-ignore
      if (suspense) {
        const suspenseOptions = {
          ...options,
          queryKey: options.queryKey as Exclude<typeof options.queryKey, undefined>,
          queryFn:
            options.queryFn === skipToken || options?.enabled
              ? () =>
                  customSkipToken as unknown as Exclude<
                    typeof options.queryFn,
                    SkipToken | undefined
                  >
              : options.queryFn,
        };
        delete options?.enabled;
        return querySuspenseOptions(suspenseOptions) as ReturnType<typeof getOptions>;
      }
      // @ts-ignore
      return queryOptions(options) as ReturnType<typeof getOptions>;
    };
  };
export const createQueryInfiniteGenerated =
  ({ client }: { client: Client }) =>
  <Shape extends TDataShape, O extends Options<Shape>, R extends AnyUseQueryOptions>(
    getOptions: GetOptionsFnRequired<Shape, O, R> | GetOptionsFn<Shape, O, R>,
    initialQueryOptions?:
      | Partial<QueryParams<false>>
      | ((params: Omit<ParamsInfinite<O, false>, 'suspense'>) => Partial<QueryParams<false>>)
  ) => {
    return <S extends boolean>({
      api,
      query: { queryFn: _qF, ...restQuery } = {},
      suspense,
    }: ParamsInfinite<O, S>) => {
      api.client = api?.client ?? client;
      const generated = getOptions(api);
      const overrides =
        typeof initialQueryOptions === 'function'
          ? initialQueryOptions({
              api,
              // @ts-expect-error
              query: { ...restQuery, queryFn: generated?.queryFn },
            })
          : initialQueryOptions;
      const options = {
        ...generated,
        initialPageParam: 1,
        getNextPageParam: getV2NextPageParam,
        getPreviousPageParam: getV2PreviousPageParam,
        ...restQuery,
        ...(overrides ?? {}),
      } as const;
      if (suspense) {
        const suspenseOptions = {
          ...options,
          queryKey: options.queryKey as Exclude<typeof options.queryKey, undefined>,
          queryFn:
            options.queryFn === skipToken || options?.enabled
              ? () =>
                  customSkipToken as unknown as Exclude<
                    typeof options.queryFn,
                    SkipToken | undefined
                  >
              : options.queryFn,
        };
        delete options?.enabled;

        return querySuspenseOptions(suspenseOptions) as ReturnType<typeof getOptions>;
      }
      // @ts-ignore
      return infiniteQueryOptions(options) as ReturnType<typeof getOptions>;
    };
  };
export type QueryKeyFn = (opt: Options) => ReturnType<typeof createQueryKey>;
export const checkMutationKeys = (
  predicateQueryKey: ReturnType<typeof createQueryKey>,
  ...queryKeyConstructors: QueryKeyFn[]
) => {
  return queryKeyConstructors.some(
    (queryKeyConstructor) => predicateQueryKey?.[0]?._id === queryKeyConstructor({})[0]?._id
  );
};

export const queryKeyPredicateResolver =
  (...queryKeyConstructors: QueryKeyFn[]) =>
  ({ queryKey }: { queryKey: ReturnType<typeof createQueryKey> }) => {
    return checkMutationKeys(queryKey, ...queryKeyConstructors);
  };
