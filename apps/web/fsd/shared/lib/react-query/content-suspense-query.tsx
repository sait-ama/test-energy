'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import {
  InfiniteData,
  useSuspenseInfiniteQuery,
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseInfiniteQueryResult,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

interface ContentSuspenseBaseProps<
  TData,
  TError = Error,
  TInfinite extends boolean = false,
  TQueryOptions extends
    | UseSuspenseQueryOptions<TData, TError>
    | UseSuspenseInfiniteQueryOptions<TData, TError, InfiniteData<TData>> = TInfinite extends true
    ? UseSuspenseInfiniteQueryOptions<TData, TError, InfiniteData<TData>>
    : UseSuspenseQueryOptions<TData, TError>,
> {
  useQuery: (
    options: TQueryOptions
  ) => TInfinite extends true
    ? UseSuspenseInfiniteQueryResult<InfiniteData<TData>, TError>
    : UseSuspenseQueryResult<TData, TError>;
  children: (
    query: TInfinite extends true
      ? UseSuspenseInfiniteQueryResult<InfiniteData<TData>, TError>
      : UseSuspenseQueryResult<TData, TError>
  ) => ReactNode;
  queryOptions: TQueryOptions;
  options?: {
    onSuccess?: () => void;
    onError?: () => void;
  };
}

const ContentSuspenseBaseQuery = <
  TData,
  TError = Error,
  TInfinite extends boolean = false,
  TQueryOptions extends
    | UseSuspenseQueryOptions<TData, TError>
    | UseSuspenseInfiniteQueryOptions<TData, TError, InfiniteData<TData>> = TInfinite extends true
    ? UseSuspenseInfiniteQueryOptions<TData, TError, InfiniteData<TData>>
    : UseSuspenseQueryOptions<TData, TError>,
>(
  props: ContentSuspenseBaseProps<TData, TError, TInfinite, TQueryOptions>
) => {
  const { children, queryOptions, options, useQuery } = props;
  // eslint-disable-next-line react-compiler/react-compiler
  const query = useQuery(queryOptions);
  const { error, isFetching, isSuccess, isError } = query;

  useEffect(() => {
    if (isSuccess && options?.onSuccess) options.onSuccess();
  }, [isSuccess, options]);

  useEffect(() => {
    if (isError && options?.onError) options.onError();
  }, [isError, options]);

  if (error && !isFetching) throw error;
  if (typeof children !== 'function') throw new Error('Children should be a function');

  return children(query);
};

const ContentSuspenseQuery = <TData, TError = Error>(
  props: Omit<ContentSuspenseBaseProps<TData, TError>, 'useQuery'>
) => (
  <ContentSuspenseBaseQuery {...props} useQuery={useSuspenseQuery}>
    {props.children}
  </ContentSuspenseBaseQuery>
);

const ContentSuspenseInfiniteQuery = <TData, TError = Error>(
  props: Omit<ContentSuspenseBaseProps<TData, TError, true>, 'useQuery'>
) => (
  // @ts-ignore
  <ContentSuspenseBaseQuery {...props} useQuery={useSuspenseInfiniteQuery}>
    {props.children}
  </ContentSuspenseBaseQuery>
);

export { ContentSuspenseInfiniteQuery, ContentSuspenseQuery };
