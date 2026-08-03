import { TitleKeys } from '~entities/title/model/query-keys';
import { TitleRepository } from '~entities/title/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  SearchField,
  SearchQuerySchema,
  SearchResponseSchema,
} from '~shared/api/models/search';
import { queryKit } from '~shared/api/react-query';

export const { getKey: getSearchKey, useQuery: useSearch } = queryKit.createInfiniteQuery<
  EndpointMeta<void, SearchQuerySchema>,
  SearchResponseSchema<SearchField>
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.search(variables),
  initialPageParam: variables.query?.page ?? 1,
  // getNextPageParam: defaultNextParam,
  getNextPageParam: (lastPage, _, lastPageParam) => {
    if (lastPage?.meta?.page >= lastPage?.meta?.total_pages) return null;

    return lastPageParam + 1;
  },
  enabled: !!variables.query?.query,
  throwOnError: true,
  retry: 1,
  queryFn: ({ pageParam }) =>
    TitleRepository.search(
      {
        ...variables,
        query: {
          page: pageParam ?? 1,
          ...variables.query!,
        },
      },
      fetchOptions
    ),
  // @ts-ignore
  // placeholderData: (previousData, previousQuery) => {
  //     console.log(variables?.query?.field, previousQuery?.queryKey?.[1]?.query?.field);
  //     if (variables?.query?.field !== previousQuery?.queryKey?.[1]?.query?.field) return { pages: [] };
  //
  //     return previousData;
  // },
}));

export const { getKey: getSuspenseSearchKey, useQuery: useSuspenseSearch } =
  queryKit.createSuspenseInfiniteQuery<
    EndpointMeta<void, SearchQuerySchema>,
    SearchResponseSchema<SearchField>
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.search(variables),
    initialPageParam: variables.query?.page ?? 1,
    // getNextPageParam: defaultNextParam,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage?.meta?.page >= lastPage?.meta?.total_pages) return null;

      return lastPageParam + 1;
    },
    enabled: !!variables.query?.query,
    throwOnError: true,
    retry: 1,
    queryFn: ({ pageParam }) =>
      TitleRepository.search(
        {
          ...variables,
          query: {
            page: pageParam ?? 1,
            ...variables.query!,
          },
        },
        fetchOptions
      ),
    // @ts-ignore
    // placeholderData: (previousData, previousQuery) => {
    //     console.log(variables?.query?.field, previousQuery?.queryKey?.[1]?.query?.field);
    //     if (variables?.query?.field !== previousQuery?.queryKey?.[1]?.query?.field) return { pages: [] };
    //
    //     return previousData;
    // },
  }));
