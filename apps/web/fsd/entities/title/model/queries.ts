import { v2TitlesMomentsTagsListOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { keepPreviousData } from '@tanstack/react-query';

import { TitleKeys } from '~entities/title/model/query-keys';
import { TitleRepository } from '~entities/title/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  ChaptersPaginatedListQuerySchema,
  ChaptersPaginatedListResponseSchema,
} from '~shared/api/models/chapter';
import type { PopularTitlesResponseSchema } from '~shared/api/models/search';
import type {
  CatalogTitleQuerySchema,
  CatalogTitlesResponseSchema,
  SimilarTitlesPaginatedListParamsSchema,
  SimilarTitlesPaginatedListQuerySchema,
  SimilarTitlesPaginatedListResponseSchema,
  TitleAdditionalResponseSchema,
  TitleAnimeParamsSchema,
  TitleBundlesParamsSchema,
  TitleBundlesQuerySchema,
  TitleBundlesResponseSchema,
  TitleFiltersAggregatedRetrieveResponseSchema,
  TitleListQuerySchema,
  TitleRelationsListParamsSchema,
  TitleRelationsListResponseSchema,
  TitleRetrieveParamsSchema,
  TitleRetrieveResponseSchema,
  TitleSliderRetrieveParamsSchema,
  TitleSliderRetrieveQuerySchema,
  TitleSliderRetrieveResponseSchema,
  TitleSlidersListQuerySchema,
  TitleSlidersListResponseSchema,
  TitlesListResponseSchema,
  TitleVoiceoverParamsSchema,
  TopTitleQuerySchema,
} from '~shared/api/models/title';
import { createQueryInfiniteGeneratedWithClient } from '~shared/api/queries-code-gen-with-client';
import { queryKit } from '~shared/api/react-query';
import { logger } from '~shared/lib/logger';
import { defaultNextParam } from '~shared/lib/react-query/default-next-param';

export const { getKey: getTitleDetailKey, useQuery: useTitleDetail } = queryKit.createQuery<
  EndpointMeta<TitleRetrieveParamsSchema, void>,
  TitleRetrieveResponseSchema
>(
  ({ variables, fetchOptions }) => ({
    enabled: !!variables.params?.dir,
    queryKey: TitleKeys.retrieve(variables),
    refetchOnMount: true,
    queryFn: () => TitleRepository.one(variables, fetchOptions),
  }),
  true
);

export const { getKey: getSuspenseTitleDetailSuspenseKey, useQuery: useSuspenseTitleDetail } =
  queryKit.createSuspenseQuery<
    EndpointMeta<TitleRetrieveParamsSchema, void>,
    TitleRetrieveResponseSchema
  >(({ variables, fetchOptions }) => ({
    enabled: !!variables?.params?.dir,
    queryKey: TitleKeys.retrieve(variables),
    // refetchOnMount: false,
    queryFn: () => TitleRepository.one(variables, fetchOptions),
  }));

export const { getKey: getTitleAdditionalKey, useQuery: useTitleAdditional } = queryKit.createQuery<
  EndpointMeta<TitleRetrieveParamsSchema, void>,
  TitleAdditionalResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.additional(variables),
  queryFn: () => TitleRepository.additional(variables, fetchOptions),
}));

export const { getKey: getTitlesByQueryInfiniteKey, useQuery: useTitlesByQueryInfinite } =
  queryKit.createInfiniteQuery<
    EndpointMeta<void, CatalogTitleQuerySchema>,
    CatalogTitlesResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.titlesByQueryOptions(variables),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.results.length !== allPages[0].results.length) return null;
      return lastPageParam + 1;
    },
    placeholderData: keepPreviousData,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: ({ pageParam }) =>
      TitleRepository.titlesByQuery(
        {
          ...variables,
          query: {
            ...variables.query,
            page: pageParam,
            count: 30,
          },
        },
        fetchOptions
      ),
  }));

export const {
  getKey: getTitlesByQuerySuspenseInfiniteKey,
  useQuery: useTitlesByQuerySuspenseInfinite,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<void, CatalogTitleQuerySchema>,
  CatalogTitlesResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.titlesByQueryOptions(variables),
  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    if (lastPage?.results?.length !== allPages[0]?.results?.length) return null;
    return lastPageParam + 1;
  },
  placeholderData: keepPreviousData,
  initialPageParam: variables.query?.page ?? 1,
  queryFn: ({ pageParam }) =>
    TitleRepository.titlesByQuery(
      {
        ...variables,
        query: {
          ...variables.query,
          page: pageParam,
          count: 30,
        },
      },
      fetchOptions
    ),
}));

export const { useQuery: usePopularTitles } = queryKit.createQuery<
  EndpointMeta<void, void>,
  PopularTitlesResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.mostSearched(variables),
  queryFn: () =>
    TitleRepository.mostSearched(variables, {
      next: { revalidate: 3600 },
      ...fetchOptions,
    }),
}));

export const { useQuery: useTitleFilters, getKey: getTitleFiltersKey } = queryKit.createQuery<
  EndpointMeta<{ fields: string[] }, void>,
  TitleFiltersAggregatedRetrieveResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.filters(variables),
  queryFn: async () => {
    const response: TitleFiltersAggregatedRetrieveResponseSchema = {};

    await Promise.all(
      variables?.params?.fields?.map((field) =>
        TitleRepository.getFilters({ params: { field } }, fetchOptions)
          .then((data) => data.filter((item) => !!item.dir))
          .then((data) => (response[field] = data))
          .catch((e) => logger.error(e))
      ) || []
    );

    return response;
  },
  // staleTime: Infinity,
  refetchOnMount: true,
  retry: false,
}));

export const { useQuery: useTitleVoiceover, getKey: getTitleVoiceoverKey } = queryKit.createQuery<
  EndpointMeta<TitleVoiceoverParamsSchema, void>,
  PopularTitlesResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.voiceover(variables),
  queryFn: () => TitleRepository.getTitleVoiceover(variables, fetchOptions),
}));

export const { useQuery: useTitleAnime, getKey: getTitleAnimeKey } = queryKit.createQuery<
  EndpointMeta<TitleAnimeParamsSchema, void>,
  PopularTitlesResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.anime(variables),
  queryFn: () => TitleRepository.getTitleAnime(variables, fetchOptions),
}));

// *********************** //
// ***** TITLES LIST ***** //
// **********************//

export const { getKey: getTitlesListQueryKey, useQuery: useTitlesListSuspenseQuery } =
  queryKit.createSuspenseQuery<EndpointMeta<void, TitleListQuerySchema>, TitlesListResponseSchema>(
    ({ variables, fetchOptions }) => ({
      queryKey: TitleKeys.list(variables),
      staleTime: Infinity,
      refetchOnMount: false,
      retry: false,
      queryFn: () => TitleRepository.list(variables, fetchOptions),
    })
  );

export const { getKey: getTitlesListInfiniteKey, useQuery: useTitlesListSuspenseInfiniteQuery } =
  queryKit.createSuspenseInfiniteQuery<
    EndpointMeta<void, TitleListQuerySchema>,
    TitlesListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.listInfinite(variables),
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
    initialPageParam: variables.query?.page ?? 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage?.titles?.length < (variables.query?.count ?? 20)) return null;
      return lastPageParam + 1;
    },
    queryFn: ({ pageParam }) =>
      TitleRepository.list(
        {
          query: { ...variables.query, count: 20, page: pageParam },
        },
        fetchOptions
      ),
  }));

// *************************** //
// ***** TITLES SLIDERS ***** //
// **************************//

export const { getKey: getTitleSlidersListQueryKey, useQuery: useTitleSlidersListSuspenseQuery } =
  queryKit.createSuspenseQuery<
    EndpointMeta<void, TitleSlidersListQuerySchema>,
    TitleSlidersListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.sliders(variables),
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
    queryFn: () =>
      TitleRepository.slidersList(variables, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
        ...fetchOptions,
      }),
  }));

export const {
  getKey: getTitleSlidersListInfiniteKey,
  useQuery: useTitleSlidersListSuspenseInfiniteQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<void, TitleSlidersListQuerySchema>,
  TitleSlidersListResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.slidersInfinite(variables),
  staleTime: Infinity,
  refetchOnMount: false,
  retry: false,
  initialPageParam: variables.query?.page ?? 1,
  getNextPageParam: (lastPage, _, lastPageParam) => {
    if (lastPage?.results?.length < (variables.query?.count ?? 20)) return null;
    return lastPageParam + 1;
  },
  queryFn: ({ pageParam }) =>
    TitleRepository.slidersList(
      {
        query: { ...variables.query, count: 20, page: pageParam },
      },
      fetchOptions
    ),
}));

// ONE SLIDER CONTENT

export const { getKey: getTitleSliderKey, useQuery: useTitleSliderContentSuspenseQuery } =
  queryKit.createSuspenseQuery<
    EndpointMeta<TitleSliderRetrieveParamsSchema, TitleSliderRetrieveQuerySchema>,
    TitleSliderRetrieveResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.slider(variables),
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
    queryFn: () =>
      TitleRepository.slider(variables, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
        ...fetchOptions,
      }),
  }));

export const {
  getKey: getTitleSliderInfiniteKey,
  useQuery: useTitleSliderContentSuspenseInfiniteQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<TitleSliderRetrieveParamsSchema, TitleSliderRetrieveQuerySchema>,
  TitleSliderRetrieveResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.sliderInfinite(variables),
  staleTime: Infinity,
  refetchOnMount: false,
  retry: false,
  initialPageParam: variables.query?.page ?? 1,
  // getNextPageParam: (lastPage, _, lastPageParam) => {
  //     if (lastPage?.results?.length < (variables.query?.count ?? 20)) return null;
  //     return lastPageParam + 1;
  // },
  getNextPageParam: defaultNextParam,
  queryFn: ({ pageParam }) =>
    TitleRepository.slider(
      {
        params: variables.params,
        query: { ...variables.query, count: 20, page: pageParam },
      },
      {
        cache: 'force-cache',
        next: { revalidate: 3600 },
        ...fetchOptions,
      }
    ),
}));

// *********************** //
// ***** TOP TITLES ***** //
// **********************//

export const { getKey: getTopTitlesQueryKey, useQuery: useTopTitlesSuspenseQuery } =
  queryKit.createSuspenseQuery<EndpointMeta<void, TopTitleQuerySchema>, TitlesListResponseSchema>(
    ({ variables, fetchOptions }) => ({
      queryKey: TitleKeys.top(variables),
      staleTime: Infinity,
      refetchOnMount: false,
      retry: false,
      queryFn: () => {
        return TitleRepository.top(variables, fetchOptions);
      },
    })
  );

export const { getKey: getTopTitlesInfiniteKey, useQuery: useTopTitlesSuspenseInfiniteQuery } =
  queryKit.createSuspenseInfiniteQuery<
    EndpointMeta<void, TopTitleQuerySchema>,
    TitlesListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.top(variables),
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
    initialPageParam: variables.query?.page ?? 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage?.results?.length < (variables.query?.count ?? 20)) return null;
      return lastPageParam + 1;
    },
    queryFn: ({ pageParam }) =>
      TitleRepository.top(
        {
          query: { count: 20, ...variables.query, page: pageParam },
        },
        fetchOptions
      ),
  }));

export const { getKey: getSimilarTitlesInfiniteKey, useQuery: useSimilarTitlesSuspenseInfinite } =
  queryKit.createSuspenseInfiniteQuery<
    EndpointMeta<SimilarTitlesPaginatedListParamsSchema, SimilarTitlesPaginatedListQuerySchema>,
    SimilarTitlesPaginatedListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.similar(variables),
    getNextPageParam: defaultNextParam,
    placeholderData: keepPreviousData,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: ({ pageParam }) =>
      TitleRepository.similar(
        {
          ...variables,
          query: {
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
  }));

export const { getKey: getTitleRelationsSuspenseKey, useQuery: useTitleRelationsSuspenseQuery } =
  queryKit.createSuspenseQuery<
    EndpointMeta<TitleRelationsListParamsSchema, void>,
    TitleRelationsListResponseSchema | null
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.relations(variables),
    queryFn: () => TitleRepository.relations(variables, fetchOptions),
    retry: false,
  }));

export const { getKey: getTitleRelationsKey, useQuery: useTitleRelations } = queryKit.createQuery<
  EndpointMeta<TitleRelationsListParamsSchema, void>,
  TitleRelationsListResponseSchema | null
>(({ variables, fetchOptions }) => ({
  queryKey: TitleKeys.relations(variables),
  queryFn: () => TitleRepository.relations(variables, fetchOptions),
  retry: false,
}));

export const { useQuery: useTitleChaptersInfiniteQuery, getKey: getTitleChaptersInfiniteQuery } =
  queryKit.createInfiniteQuery<
    EndpointMeta<void, ChaptersPaginatedListQuerySchema>,
    ChaptersPaginatedListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.titleChapters(variables),
    queryFn: ({ pageParam }) =>
      TitleRepository.titleChapters({
        ...variables,
        query: { ...variables.query, page: pageParam },
        fetchOptions,
      }),
    getNextPageParam: defaultNextParam,
    placeholderData: keepPreviousData,
    initialPageParam: variables.query?.page ?? 1,
  }));

export const { useQuery: useTitleBundlesQuery, getKey: getTitleBundlesQuery } =
  queryKit.createQuery<
    EndpointMeta<TitleBundlesParamsSchema, TitleBundlesQuerySchema>,
    TitleBundlesResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: TitleKeys.titleBundles(variables),
    queryFn: () => TitleRepository.getTitleBundles(variables, fetchOptions),
  }));

export const reV2TitlesMomentsTagsListOptions = createQueryInfiniteGeneratedWithClient(
  v2TitlesMomentsTagsListOptions,
  { retry: false }
);
