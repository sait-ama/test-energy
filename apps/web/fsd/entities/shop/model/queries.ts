import { keepPreviousData } from '@tanstack/react-query';

import type { EndpointMeta } from '~shared/api/api-toolkit';
import {
  DeckRetrieveParamsSchema,
  DeckRetrieveResponseSchema,
  DecksListPaginatedListQuerySchema,
  DecksListPaginatedListResponseSchema,
  ShopItemDirParamsSchema,
  ShopItemSchema,
  ShopItemTypes,
  ShopPaginatedListOrderings,
  ShopPaginatedListQuerySchema,
  ShopPaginatedListResponseSchema,
  ThemeRetrieveParamsSchema,
  ThemeRetrieveResponseSchema,
} from '~shared/api/models/shop';
import { queryKit } from '~shared/api/react-query';
import { defaultNextParam } from '~shared/lib/react-query/default-next-param';
import { getServerDataWithTz } from '~shared/utils/get-client-date';

import { ShopQueryKeys } from './query-keys';
import { ShopRepository } from './repository';

export const { useQuery: useShopPaginatedListSuspenseQuery, getKey: getShopPaginatedListQuery } =
  queryKit.createSuspenseInfiniteQuery<
    EndpointMeta<never, ShopPaginatedListQuerySchema>,
    ShopPaginatedListResponseSchema
  >(
    ({
      variables: { query: { page = 1, count = 20, ordering, type, ...other } = {} },
      fetchOptions,
    }) => {
      const obj = {
        ...other,
        page,
        count,
        ordering: ordering || ShopPaginatedListOrderings.EXPANSIVE,
        type: type || ShopItemTypes.AVATAR,
      };
      return {
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
        initialPageParam: page,
        select: (v) => {
          for (const page of v.pages) {
            for (const res of page.results) {
              res.availability_start_date = !res.availability_start_date
                ? res.availability_start_date
                : getServerDataWithTz(res.availability_start_date);
              res.availability_end_date = !res.availability_end_date
                ? res.availability_end_date
                : getServerDataWithTz(res.availability_end_date);
            }
          }
          return v;
        },
        getNextPageParam: defaultNextParam,
        queryFn: ({ pageParam = 1 }) =>
          ShopRepository.shopFeedGetCatalog(
            {
              query: {
                ...obj,
                page: pageParam,
              },
              ...other,
            },
            fetchOptions
          ),
        queryKey: ShopQueryKeys.ShopCatalog.list({ query: obj, ...other }),
      };
    }
  );

export const { useQuery: useShopItemQueryByDirQuery, getKey: getShopItemByDirQuery } =
  queryKit.createQuery<EndpointMeta<ShopItemDirParamsSchema, never>, ShopItemSchema>(
    ({ fetchOptions, variables }) => ({
      enabled: !!variables.params?.shopItemDir,
      retry: false,
      staleTime: Infinity,
      gcTime: Infinity,
      queryFn: () => ShopRepository.getShopItemByDir(variables, fetchOptions),
      queryKey: ShopQueryKeys.ShopItem.byDir(variables),
    }),
    true
  );

export const { getKey: getShopItemByDirSuspenseQuery } = queryKit.createSuspenseQuery<
  EndpointMeta<ShopItemDirParamsSchema, never>,
  ShopItemSchema
>(({ fetchOptions, variables }) => ({
  enabled: !!variables.params?.shopItemDir,
  retry: false,
  staleTime: Infinity,
  gcTime: Infinity,
  queryFn: () => ShopRepository.getShopItemByDir(variables, fetchOptions),
  queryKey: ShopQueryKeys.ShopItem.byDir(variables),
}));

export const {
  useQuery: useShopDecksPaginatedListSuspenseQuery,
  getKey: getShopDecksPaginatedListQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<void, DecksListPaginatedListQuerySchema>,
  DecksListPaginatedListResponseSchema
>(({ variables, fetchOptions }) => {
  return {
    initialPageParam: variables?.query?.page ?? 1,
    getNextPageParam: defaultNextParam,
    select: (v) => {
      for (const page of v.pages) {
        for (const res of page.results) {
          res.availability_start_date = !res.availability_start_date
            ? res.availability_start_date
            : getServerDataWithTz(res.availability_start_date);
          res.availability_end_date = !res.availability_end_date
            ? res.availability_end_date
            : getServerDataWithTz(res.availability_end_date);
        }
      }
      return v;
    },
    queryFn: ({ pageParam = 1 }) =>
      ShopRepository.decksList(
        {
          ...variables,
          query: {
            ...variables.query,
            page: pageParam,
          },
        },
        fetchOptions
      ),
    queryKey: ShopQueryKeys.Deck.list(variables),
  };
});

export const { useQuery: useDeckById, getKey: getDeckById } = queryKit.createSuspenseQuery<
  EndpointMeta<DeckRetrieveParamsSchema, void>,
  DeckRetrieveResponseSchema
>(({ fetchOptions, variables }) => ({
  retry: false,
  queryFn: () => ShopRepository.deckById(variables, fetchOptions),
  queryKey: ShopQueryKeys.Deck.byId(variables),
}));

export const { useQuery: useThemeByDirSuspense, getKey: getThemeByDir } =
  queryKit.createSuspenseQuery<
    EndpointMeta<ThemeRetrieveParamsSchema, void>,
    ThemeRetrieveResponseSchema | null
  >(({ fetchOptions, variables }) => ({
    retry: false,
    enabled: !variables?.params?.themeDir,
    queryFn: !variables?.params?.themeDir
      ? () => Promise.resolve(null)
      : () => ShopRepository.themeByDir(variables, fetchOptions),
    queryKey: ShopQueryKeys.Theme.byDir(variables),
  }));
