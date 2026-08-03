import { v2InventoryItemsMomentsRetrieveInfiniteOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { EndpointMeta } from '~shared/api/api-toolkit';
import { FormsTypes } from '~shared/api/models/forms';
import type {
  HeroCardSchema,
  InventoryCustomizationParamsSchema,
  InventoryCustomizationQuerySchema,
  InventoryDeckParamsSchema,
  InventoryDeckQuerySchema,
  InventoryDeckRetrieveListResponseSchema,
  InventoryHeroCardByIdParamsSchema,
  InventoryHeroCardByIdQuerySchema,
  InventoryHeroCardByIdResponseSchema,
  InventoryHeroCardByTitleParamsSchema,
  InventoryHeroCardByTitleQuerySchema,
  InventoryHeroCardByTitleRetrieveResponseSchema,
  InventoryHeroCardByUserParamsSchema,
  InventoryHeroCardByUserQuerySchema,
  InventoryHeroCardByUserRetrieveResponseSchema,
  InventoryHeroCardCatalogListResponseSchema,
  InventoryHeroCardCatalogQuerySchema,
  InventoryHeroCardFavoriteParamsSchema,
  InventoryHeroCardFavoriteQuerySchema,
  InventoryUpgradeHistoryParamsSchema,
  InventoryUpgradeHistoryQuerySchema,
  InventoryUpgradeHistoryRetrieveResponseSchema,
  InventoryWishesByHeroCardIdParamsSchema,
  InventoryWishesByHeroCardIdQuerySchema,
  InventoryWishesByHeroCardIdResponseSchema,
} from '~shared/api/models/inventory';
import { createQueryInfiniteGeneratedWithClient } from '~shared/api/queries-code-gen-with-client';
import { queryKit } from '~shared/api/react-query';
import { defaultNextParam } from '~shared/lib/react-query/default-next-param';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

import { InventoryKeys } from './query-keys';
import { InventoryRepository } from './repository';

export const { getKey: getHeroCardsByUserInfiniteQuery, useQuery: useHeroCardsByUserInfinite } =
  queryKit.createSuspenseInfiniteQuery<
    EndpointMeta<InventoryHeroCardByUserParamsSchema, InventoryHeroCardByUserQuerySchema>,
    InventoryHeroCardByUserRetrieveResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.cardByUser(variables),
    getNextPageParam: defaultNextParam,
    staleTime: Infinity,
    retry: false,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: async ({ pageParam }) =>
      InventoryRepository.HeroCard.getListByUser(
        {
          ...variables,
          query: {
            count: 20,
            ordering: 'id',
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
  }));

export const { getKey: getUpgradeHistoryInfiniteKey, useQuery: useUpgradeHistoryInfinite } =
  queryKit.createSuspenseInfiniteQuery<
    EndpointMeta<InventoryUpgradeHistoryParamsSchema, InventoryUpgradeHistoryQuerySchema>,
    InventoryUpgradeHistoryRetrieveResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.upgradeHistory(variables),
    getNextPageParam: defaultNextParam,
    staleTime: Infinity,
    retry: false,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: async ({ pageParam }) =>
      InventoryRepository.HeroCard.getUpgradeHistoryList(
        {
          ...variables,
          query: {
            count: 20,
            ...variables.query,
            ordering: 'id',
            page: pageParam,
          },
        },
        fetchOptions
      ),
  }));

// export const { getKey: getInventoryHeroCardByIdKey, useQuery: useInventoryHeroCardByIdQuery } =
//   queryKit.createInfiniteQuery<
//     EndpointMeta<InventoryHeroCardByUserParamsSchema, InventoryHeroCardByUserQuerySchema>,
//     HeroCardSchema | null
//   >(({ variables, fetchOptions }) => ({
//     queryKey: InventoryKeys.cardByUser(variables),
//     staleTime: Infinity,
//     retry: false,
//     initialPageParam: 1,
//     //@ts-ignore
//     select: ({ pages }) => pages?.flatMap((it) => it.results)?.[0] || null,
//     //@ts-ignore
//     queryFn: async ({ pageParam }) =>
//       InventoryRepository.HeroCard.getListByUser(
//         {
//           ...variables,
//           query: {
//             count: 20,
//             ordering: 'id',
//             ...variables.query,
//             page: pageParam,
//           },
//         },
//         fetchOptions
//       ),
//   }));
export const { getKey: getHeroCardsByTitleInfiniteKey, useQuery: useHeroCardsByTitleInfinite } =
  queryKit.createInfiniteQuery<
    EndpointMeta<InventoryHeroCardByTitleParamsSchema, InventoryHeroCardByTitleQuerySchema>,
    InventoryHeroCardByTitleRetrieveResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.cardByTitle(variables),
    getNextPageParam: defaultNextParam,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: ({ pageParam }) =>
      InventoryRepository.HeroCard.getByTitle(
        {
          ...variables,
          query: {
            count: 30,
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
  }));

export const { getKey: getInventoryDecksInfiniteKey, useQuery: useInventoryDecksInfiniteQuery } =
  queryKit.createInfiniteQuery<
    EndpointMeta<InventoryDeckParamsSchema, InventoryDeckQuerySchema>,
    InventoryDeckRetrieveListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.decks(variables),
    getNextPageParam: defaultNextParam,
    staleTime: Infinity,
    retry: false,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: ({ pageParam }) =>
      InventoryRepository.Deck.getList(
        {
          ...variables,
          query: {
            count: 20,
            ordering: 'id',
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
  }));

export const { getKey: getFavoriteHeroCardsKey, useQuery: useFavoriteHeroCards } =
  queryKit.createQuery<
    EndpointMeta<InventoryHeroCardFavoriteParamsSchema, InventoryHeroCardFavoriteQuerySchema>,
    HeroCardSchema[]
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.favoriteCard(variables),
    staleTime: Infinity,
    retry: false,
    enabled: !!variables.params?.userId,
    queryFn: () => InventoryRepository.HeroCard.getFavoriteList(variables, fetchOptions),
  }));

export const { getKey: getCustomizationsKey, useQuery: useCustomizations } =
  queryKit.createInfiniteQuery<
    EndpointMeta<InventoryCustomizationParamsSchema, InventoryCustomizationQuerySchema>,
    any
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.customizationItem(variables),
    staleTime: Infinity,
    retry: false,
    enabled: !!variables.params?.userId,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: async ({ pageParam }) =>
      InventoryRepository.Customization.getList(
        {
          ...variables,
          query: {
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
    getNextPageParam: defaultNextParam,
  }));

export const reV2InventoryItemsMomentsRetrieveInfiniteOptions =
  createQueryInfiniteGeneratedWithClient(
    v2InventoryItemsMomentsRetrieveInfiniteOptions,
    ({ api: { path } = {} }) => ({
      staleTime: Infinity,
      retry: false,
      enabled: !path?.user_id,
    })
  );

export const { getKey: getWishesByCardInfiniteKey, useQuery: useWishesByCardInfiniteQuery } =
  queryKit.createInfiniteQuery<
    EndpointMeta<InventoryWishesByHeroCardIdParamsSchema, InventoryWishesByHeroCardIdQuerySchema>,
    InventoryWishesByHeroCardIdResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.wishesByCard(variables),
    getNextPageParam: defaultNextParam,
    initialPageParam: variables.query?.page ?? 1,
    queryFn: ({ pageParam }) =>
      InventoryRepository.HeroCard.getWishesListByCard(
        {
          ...variables,
          query: {
            count: 20,
            ordering: '-id',
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
  }));

export const getCardFormsKey = () =>
  getTypesBaseKey({
    type: FormsTypes.CARDS,
    get: ['ranks'],
  });

export const useCardForms = () => useQuery(getCardFormsKey());

export const { useQuery: useHeroCardByIdQuery, getKey: getHeroCardQuery } = queryKit.createQuery<
  EndpointMeta<InventoryHeroCardByIdParamsSchema, InventoryHeroCardByIdQuerySchema>,
  InventoryHeroCardByIdResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: InventoryKeys.cardById(variables),
  staleTime: Infinity,
  retry: false,
  queryFn: async () => InventoryRepository.HeroCard.getById(variables, fetchOptions),
}));

export const { useQuery: useHeroCardByIdSuspenseQuery, getKey: getHeroCardSuspenseQuery } =
  queryKit.createSuspenseQuery<
    EndpointMeta<InventoryHeroCardByIdParamsSchema, InventoryHeroCardByIdQuerySchema>,
    InventoryHeroCardByIdResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.cardById(variables),
    staleTime: Infinity,
    retry: false,
    queryFn: async () => InventoryRepository.HeroCard.getById(variables, fetchOptions),
  }));

export const { getKey: getHeroCardCatalog, useQuery: useHeroCardCatalog } =
  queryKit.createInfiniteQuery<
    EndpointMeta<void, InventoryHeroCardCatalogQuerySchema>,
    InventoryHeroCardCatalogListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: InventoryKeys.exchange(variables),
    placeholderData: keepPreviousData,
    getNextPageParam: defaultNextParam,

    initialPageParam: variables.query?.page ?? 1,
    queryFn: ({ pageParam }) =>
      InventoryRepository.HeroCard.catalog(
        {
          ...variables,
          query: {
            count: 30,
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
  }));
