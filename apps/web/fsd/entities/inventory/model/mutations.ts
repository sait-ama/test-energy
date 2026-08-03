import {
  activityVoteMomentCreateMutation,
  QueryKey,
  v2InventoryItemsMomentsRetrieveInfiniteQueryKey,
  v2TitlesMomentsCatalogListInfiniteQueryKey,
  v2TitlesMomentsViewCreateMutation,
  v2UsersCurrentRetrieveQueryKey,
} from '@re/api/generated/@tanstack/react-query.gen';
import { Options } from '@re/api/generated/sdk.gen';
import type { InfiniteData } from '@tanstack/react-query';
import { type DefaultError, useQueryClient } from '@tanstack/react-query';

import { reV2TitlesMomentsListQueryKey } from '~entities/moment/model/query-keys';
import { UserKeys } from '~entities/user/model/query-keys';
import type {
  InventoryDeckOpenParamsSchema,
  InventoryDeckOpenRequestSchema,
  InventoryExchangeByIdParamsSchema,
  InventoryExchangeChangeStatusRequestSchema,
  InventoryHeroCardChangeExchangeableRequestSchema,
  InventoryHeroCardChangeFavoriteRequestSchema,
  InventoryHeroCardChangeWishTypeRequestSchema,
  InventoryHeroCardDeleteWishTypeParamsSchema,
  InventoryHeroCardMergeParamsSchema,
  InventoryHeroCardMergeRequestSchema,
  InventoryHeroCardMergeResponseSchema,
  InventoryHeroCardUpdateRequestSchema,
} from '~shared/api/models/inventory';
import { LikeDislikeType, RatedStatus } from '~shared/api/models/post';
import type { MomentPaginatedListResponseSchema } from '~shared/api/models/title';
import { getQueryClient, useOptimisticMutation, withClientOptions } from '~shared/api/react-query';
import { getInitialState, likeDislikeReducer } from '~shared/lib/like-dislike/model/store';
import { useSession } from '~shared/lib/session/use-session';

import { InventoryKeys } from './query-keys';
import { InventoryRepository } from './repository';
//todo
export const useSetCustomization = (params: { userId: NumberIsomorphic }) =>
  useOptimisticMutation<void, DefaultError, { item: NumberIsomorphic }>({
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: v2UsersCurrentRetrieveQueryKey({}) });
    },
    invalidate: [UserKeys.detailById({ params })],
    mutationFn: ({ item }) => InventoryRepository.Customization.set({ data: { item }, params }),
  });

export const useUnsetCustomization = (params: { userId: NumberIsomorphic }) =>
  useOptimisticMutation<void, DefaultError, { item: NumberIsomorphic }>({
    onSuccess: () => {
      const client = getQueryClient();
      client.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey?.[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]?._id,
      });
    },
    invalidate: [UserKeys.detailById({ params })],
    mutationFn: ({ item }) => InventoryRepository.Customization.unset({ data: { item }, params }),
  });

export const useUpdateHeroCard = ({ cardId }: { cardId: NumberIsomorphic }) =>
  useOptimisticMutation<void, DefaultError, InventoryHeroCardUpdateRequestSchema>({
    mutationFn: (data) => InventoryRepository.HeroCard.update({ data, params: { cardId } }),
  });

export const useChangeExchangeStatus = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    {
      data: InventoryExchangeChangeStatusRequestSchema;
      params: InventoryExchangeByIdParamsSchema;
    }
  >({
    mutationFn: (data) => InventoryRepository.Exchange.changeStatus(data),
  });

export const useChangeFavoriteHeroCards = () => {
  const session = useSession()!;
  return useOptimisticMutation<void, DefaultError, InventoryHeroCardChangeFavoriteRequestSchema>({
    invalidate: ({ queryKey }) => queryKey[0] === InventoryKeys.favoriteCard({})[0],
    mutationFn: ({ value, prevValue }) =>
      InventoryRepository.HeroCard.changeFavorite({
        params: { userId: session?.id },
        data: { value, prevValue },
      }),
  });
};

export const useChangeExchangeableHeroCards = () => {
  const session = useSession()!;
  return useOptimisticMutation<
    void,
    DefaultError,
    InventoryHeroCardChangeExchangeableRequestSchema
  >({
    invalidate: ({ queryKey }) => queryKey[0] === InventoryKeys.favoriteCard({})[0],
    mutationFn: (data) =>
      InventoryRepository.HeroCard.changeExchangeable({
        params: { userId: session?.id },
        data,
      }),
  });
};

export const useMergeCards = () =>
  useOptimisticMutation<
    InventoryHeroCardMergeResponseSchema,
    DefaultError,
    InventoryHeroCardMergeRequestSchema & InventoryHeroCardMergeParamsSchema
  >({
    invalidate: ({ queryKey }) => queryKey[0] === InventoryKeys.cardByUser({})[0],
    mutationFn: (data) =>
      InventoryRepository.HeroCard.merge({
        data: { cards: data.cards, is_random: data.is_random, type: data.type },
        params: { userId: data.userId },
      }),
  });
export const useLikeMoment = (params?: Parameters<typeof activityVoteMomentCreateMutation>[0]) => {
  const client = useQueryClient();
  return useOptimisticMutation({
    ...activityVoteMomentCreateMutation(withClientOptions(params)),
    onMutate: ({ body: { moment } }) => {
      client.setQueriesData<InfiniteData<MomentPaginatedListResponseSchema>>(
        {
          predicate: ({ queryKey }: { queryKey: QueryKey<Options> }) => {
            const [{ _id: uniq }] = queryKey;
            const [{ _id: titleCatalogMomentsId }] = v2TitlesMomentsCatalogListInfiniteQueryKey();
            const [{ _id: listMomentsId }] = reV2TitlesMomentsListQueryKey();
            const [{ _id: inventoryListId }] = v2InventoryItemsMomentsRetrieveInfiniteQueryKey({
              path: { user_id: NaN },
            });
            return (
              uniq === titleCatalogMomentsId || uniq === listMomentsId || uniq === inventoryListId
            );
          },
        },
        (v) => {
          if (!v) return v;
          for (const page of v.pages) {
            for (const curMoment of page.results) {
              if (curMoment.id === moment) {
                const state = likeDislikeReducer(
                  getInitialState(curMoment.rated, curMoment.score),
                  { type: LikeDislikeType.LIKE }
                );
                curMoment.score = state.score;
                curMoment.rated = state.liked
                  ? RatedStatus.LIKED
                  : state.disliked
                    ? RatedStatus.DISLIKED
                    : null;
              }
            }
          }
          return { pages: v.pages, pageParams: v.pageParams };
        }
      );
    },
  });
};

export const useViewMoment = (params?: Parameters<typeof v2TitlesMomentsViewCreateMutation>[0]) => {
  return useOptimisticMutation({
    ...v2TitlesMomentsViewCreateMutation(withClientOptions(params)),
  });
};

export const useOpenDeck = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    InventoryDeckOpenRequestSchema & InventoryDeckOpenParamsSchema
  >({
    invalidate: ({ queryKey }) => queryKey[0] === InventoryKeys.decks({})[0],
    mutationFn: ({ id, chosen_card_id }) =>
      InventoryRepository.Deck.open({
        params: { id },
        data: { chosen_card_id },
      }),
  });

export const useChangeWishType = () =>
  useOptimisticMutation<void, DefaultError, InventoryHeroCardChangeWishTypeRequestSchema>({
    invalidate: ({ queryKey }) =>
      queryKey[0] === InventoryKeys.wishesByCard({})[0] ||
      queryKey[0] === InventoryKeys.cardByUser({})[0],
    mutationFn: (data) =>
      InventoryRepository.HeroCard.changeWishType({
        data,
      }),
  });

export const useDeleteWishType = () =>
  useOptimisticMutation<void, DefaultError, InventoryHeroCardDeleteWishTypeParamsSchema>({
    invalidate: ({ queryKey }) =>
      queryKey[0] === InventoryKeys.wishesByCard({})[0] ||
      queryKey[0] === InventoryKeys.cardByUser({})[0],
    mutationFn: (data) =>
      InventoryRepository.HeroCard.deleteWishType({
        params: data,
      }),
  });
