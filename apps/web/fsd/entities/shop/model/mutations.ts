import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import type { QueryKey } from '@tanstack/react-query';

import { getShopItemByDirQuery } from '~entities/shop/model/queries';
import { ShopQueryKeys } from '~entities/shop/model/query-keys';
import { ShopRepository } from '~entities/shop/model/repository';
import type {
  ShopItemByIdParamsSchema,
  ShopItemByIdRequestSchema,
  ShopItemSchema,
  ShopPaginatedListResponseSchema,
} from '~shared/api/models/shop';
import { ShopItemTypes } from '~shared/api/models/shop';
import {
  getQueryClient,
  OptimisticMutationOptions,
  queryClient,
  useOptimisticMutation,
} from '~shared/api/react-query';

interface UseShopLocalMutation {
  shopItemId: number;
  type: ShopItemTypes | null;
  mutateFn: (item: ShopItemSchema) => Partial<ShopItemSchema>;
}

export const shopLocalMutation = async ({ shopItemId, type, mutateFn }: UseShopLocalMutation) => {
  queryClient.setQueriesData<InfiniteData<ShopPaginatedListResponseSchema>>(
    {
      predicate: ({ queryKey }) => {
        const key = queryKey as QueryKey;
        const [uniquePart] = key;
        if (uniquePart !== ShopQueryKeys.ShopCatalog.UNIQUE_PART) return false;
        const typedKey = key as ShopQueryKeys.ShopCatalog.QueryType;
        const [_, extra] = typedKey;
        return extra?.query?.type === type;
      },
    },
    (curData) => {
      if (!curData) return curData;
      return {
        ...curData,
        pages: curData?.pages.map((v) => ({
          ...v,
          results: v.results.map((v) => (shopItemId !== v.id ? v : { ...v, ...mutateFn(v) })),
        })),
      };
    }
  );
};
const getShopItemStateAfterBuy: Parameters<typeof shopLocalMutation>[0]['mutateFn'] = (
  shopItem
): Partial<typeof shopItem> => {
  return {
    amount: shopItem?.amount === null ? shopItem.amount : Math.max(shopItem?.amount - 1, 0),
    is_bought: true,
  };
};
const buyMutationFn = ({
  shopItemId,
  type,
}: Omit<Parameters<typeof shopLocalMutation>[0], 'mutateFn'>) => {
  const mutateFn: Parameters<typeof shopLocalMutation>[0]['mutateFn'] = (shopItem) => {
    return getShopItemStateAfterBuy(shopItem);
  };
  return shopLocalMutation({ shopItemId, type, mutateFn });
};
export const useBuyShopItemMutation = (type: ShopItemTypes | null, dir?: string) =>
  useOptimisticMutation<
    void,
    DefaultError,
    ShopItemByIdParamsSchema & ShopItemByIdRequestSchema,
    ShopItemByIdParamsSchema
  >({
    mutationKey: ['on-buy', 'shop-item', { params: { type } }],
    onMutate: async ({ shopItemId }) => {
      await buyMutationFn({ shopItemId, type });
      return { shopItemId };
    },
    onSuccess: () => {
      if (dir) {
        const { queryKey } = getShopItemByDirQuery({ variables: { params: { shopItemDir: dir } } });
        const queryClient = getQueryClient();
        queryClient.setQueryData<ShopItemSchema, unknown>(queryKey, (item) => {
          if (!item) return item;
          return { ...item, ...getShopItemStateAfterBuy(item) };
        });
      }
    },
    mutationFn: ({ shopItemId, currency }) =>
      ShopRepository.buyShopItemById({ params: { shopItemId }, data: { currency } }),
  });

export const useBuyDeck = (
  mutationOptions: OptimisticMutationOptions<
    void,
    DefaultError,
    ShopItemByIdParamsSchema & ShopItemByIdRequestSchema,
    ShopItemByIdParamsSchema
  >
) =>
  useOptimisticMutation<
    void,
    DefaultError,
    ShopItemByIdParamsSchema & ShopItemByIdRequestSchema,
    ShopItemByIdParamsSchema
  >({
    ...mutationOptions,
    mutationKey: ['on-buy', 'shop-item', { params: { type: ShopItemTypes.DECK } }],
    mutationFn: ({ shopItemId, currency, count }) =>
      ShopRepository.buyShopItemById({ params: { shopItemId }, data: { currency, count } }),
  });
