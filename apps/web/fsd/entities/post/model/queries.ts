import { InfiniteData, UseInfiniteQueryOptions } from '@tanstack/react-query';

import { getV1NextParam, getV2NextPageParam } from '@re/api/exports-core';
import {
  v2ForumRetrieveInfiniteOptions,
  v2ForumSearchRetrieveInfiniteOptions,
} from '@re/api/generated/@tanstack/react-query.gen';
import {
  PostEntity,
  V2ForumRetrieveResponse,
  V2ForumSearchRetrieveResponse,
} from '@re/api/generated/types.gen';

import { client } from '~shared/api/client';
import { noopObject } from '~shared/utils/noop';

type RequestData = Parameters<typeof v2ForumSearchRetrieveInfiniteOptions>[0];
export const getPostsFeedPaginatedSuspenseListQueryOptions = (
  params: RequestData & { clientOrdering: 'week' | 'id' | '-id' | '-score' | 'score' },
  override?: Partial<
    Omit<
      UseInfiniteQueryOptions<
        Array<PostEntity>,
        unknown,
        InfiniteData<V2ForumSearchRetrieveResponse>
      >,
      'queryFn' | 'queryKey'
    >
  >
) => {
  const {
    clientOrdering,
    query: { count = 20, page = 1, week = false, search = '', ...otherQuery } = {},
    ...otherParams
  } = params ?? {};

  const query = v2ForumSearchRetrieveInfiniteOptions({
    client,

    query: {
      count,
      page,
      week: week || clientOrdering === 'week',
      search,
      // @ts-ignore
      ordering: clientOrdering === 'week' ? '-id' : clientOrdering,
      ...otherQuery,
    },
    ...otherParams,
  });
  query.getNextPageParam = getV2NextPageParam;
  query.initialPageParam = 1;
  return { ...query, ...(override ?? noopObject) };
};
type RequestDataSubject = Parameters<typeof v2ForumRetrieveInfiniteOptions>[0];
export const getPostsPaginatedSuspenseListQueryOptions = (
  params: RequestDataSubject,
  override?: Partial<
    Omit<
      UseInfiniteQueryOptions<Array<PostEntity>, unknown, InfiniteData<V2ForumRetrieveResponse>>,
      'queryFn' | 'queryKey'
    >
  >
) => {
  const { query: { count = 20, page = 1, ...otherQuery } = {}, ...otherParams } = params ?? {};

  const query = v2ForumRetrieveInfiniteOptions({
    client,
    query: {
      count,
      page,
      ...otherQuery,
    },
    ...otherParams,
  });
  query.getNextPageParam = getV1NextParam;
  query.initialPageParam = 1;
  return { ...query, ...override };
};
