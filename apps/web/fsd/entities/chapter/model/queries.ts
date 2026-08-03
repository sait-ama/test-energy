import { ChapterQueryKeys } from '~entities/chapter/model/query-keys';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  ChapterRetrieveParamsSchema,
  ChapterRetrieveResponseSchema,
  ChaptersPaginatedListQuerySchema,
  ChaptersPaginatedListResponseSchema,
} from '~shared/api/models/chapter';
import { queryKit } from '~shared/api/react-query';
import { defaultNextParam, defaultPreviousParam } from '~shared/lib/react-query/default-next-param';

import { ChapterRepository } from './repository';

export const { getKey: getChapterKey, useQuery: useChapter } = queryKit.createQuery<
  EndpointMeta<ChapterRetrieveParamsSchema, void>,
  ChapterRetrieveResponseSchema
>(
  ({ variables, fetchOptions }) => ({
    queryKey: ChapterQueryKeys.detail(variables),
    queryFn: () => ChapterRepository.get(variables, fetchOptions),
    retry: false,
  }),
  true
);

export const { getKey: getChapterSuspenseKey, useQuery: useChapterSuspense } =
  queryKit.createSuspenseQuery<
    EndpointMeta<ChapterRetrieveParamsSchema, void>,
    ChapterRetrieveResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: ChapterQueryKeys.detail(variables),
    queryFn: () => ChapterRepository.get(variables, fetchOptions),
    retry: false,
  }));

export const { useQuery: useLastChapter, getKey: getLastChapterKey } = queryKit.createQuery<
  EndpointMeta<void, { branch_id: string }>,
  ChapterRetrieveResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: ChapterQueryKeys.last(variables),
  queryFn: () => ChapterRepository.getLast(variables, fetchOptions),
}));

export const { getKey: getChaptersListQuery, useQuery: useChaptersListInfinite } =
  queryKit.createInfiniteQuery<
    EndpointMeta<void, ChaptersPaginatedListQuerySchema>,
    ChaptersPaginatedListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: ChapterQueryKeys.list(variables),
    initialPageParam: variables.query?.page || 1,
    queryFn: ({ pageParam }) =>
      ChapterRepository.list(
        {
          ...variables,
          query: {
            ...variables.query,
            branch_id: variables.query!.branch_id,
            page: pageParam,
          },
        },
        fetchOptions
      ),
    getNextPageParam: defaultNextParam,
    getPreviousPageParam: defaultPreviousParam,
  }));
