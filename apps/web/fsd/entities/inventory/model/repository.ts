import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  InventoryDeckOpenParamsSchema,
  InventoryDeckOpenRequestSchema,
  InventoryExchangeAcceptRequestSchema,
  InventoryExchangeByIdParamsSchema,
  InventoryExchangeByIdQuerySchema,
  InventoryExchangeByUserParamsSchema,
  InventoryExchangeByUserQuerySchema,
  InventoryExchangeByUserRetrieveListResponseSchema,
  InventoryExchangeChangeStatusRequestSchema,
  InventoryExchangeCreateRequestSchema,
  InventoryExchangeDenyRequestSchema,
  InventoryHeroCardByCharacterParamsSchema,
  InventoryHeroCardByCharacterQuerySchema,
  InventoryHeroCardByCharacterRetrieveResponseSchema,
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
  InventoryHeroCardChangeExchangeableParamsSchema,
  InventoryHeroCardChangeExchangeableQuerySchema,
  InventoryHeroCardChangeExchangeableRequestSchema,
  InventoryHeroCardChangeExchangeableResponseSchema,
  InventoryHeroCardChangeFavoriteParamsSchema,
  InventoryHeroCardChangeFavoriteQuerySchema,
  InventoryHeroCardChangeFavoriteRequestSchema,
  InventoryHeroCardChangeFavoriteResponseSchema,
  InventoryHeroCardChangeWishTypeParamsSchema,
  InventoryHeroCardChangeWishTypeQuerySchema,
  InventoryHeroCardChangeWishTypeRequestSchema,
  InventoryHeroCardChangeWishTypeResponseSchema,
  InventoryHeroCardCreateRequestSchema,
  InventoryHeroCardDeleteWishTypeParamsSchema,
  InventoryHeroCardDeleteWishTypeQuerySchema,
  InventoryHeroCardDeleteWishTypeRequestSchema,
  InventoryHeroCardDeleteWishTypeResponseSchema,
  InventoryHeroCardFavoriteParamsSchema,
  InventoryHeroCardFavoriteQuerySchema,
  InventoryHeroCardFavoriteRetrieveResponseSchema,
  InventoryHeroCardMergeParamsSchema,
  InventoryHeroCardMergeQuerySchema,
  InventoryHeroCardMergeRequestSchema,
  InventoryHeroCardMergeResponseSchema,
  InventoryHeroCardUpdateParamsSchema,
  InventoryHeroCardUpdateRequestSchema,
  InventoryUpgradeHistoryParamsSchema,
  InventoryUpgradeHistoryQuerySchema,
  InventoryUpgradeHistoryRetrieveResponseSchema,
  InventoryWishesByHeroCardIdParamsSchema,
  InventoryWishesByHeroCardIdQuerySchema,
  InventoryWishesByHeroCardIdResponseSchema,
} from '~shared/api/models/inventory';
import { ExchangeStatus, InventoryItemType } from '~shared/api/models/inventory';

import { InventoryEndpoints } from './endpoints';

const createHeroCardRouter = apiToolkit(({ api, toolbox }) => ({
  getFavoriteList: toolbox.createMethod<
    InventoryHeroCardFavoriteRetrieveResponseSchema,
    void,
    InventoryHeroCardFavoriteParamsSchema,
    InventoryHeroCardFavoriteQuerySchema
  >(async (variables, opts) => {
    const response = await api.get(InventoryEndpoints.HeroCard.favorite(variables), opts);

    // return {
    //     ...response,
    //     results: response.results.sort((a, b) => a.index - b.index),
    // };

    return response.sort((a, b) => a.index - b.index);
  }),
  changeFavorite: toolbox.createMethod<
    InventoryHeroCardChangeFavoriteResponseSchema,
    InventoryHeroCardChangeFavoriteRequestSchema,
    InventoryHeroCardChangeFavoriteParamsSchema,
    InventoryHeroCardChangeFavoriteQuerySchema
  >((variables, opts) => {
    const { value, prevValue } = variables.data!;

    const data = {};

    prevValue.forEach((card_id) => {
      //@ts-ignore
      data[card_id] = {
        card_id,
        is_favorite: false,
      };
    });

    value.forEach((card_id, index) => {
      //@ts-ignore
      data[card_id] = {
        card_id,
        is_favorite: true,
        index: index,
      };
    });

    return api.put(
      `/api/v2/inventory/${variables.params!.userId}/cards/manage/ `,
      { action: 'change_favorite', cards: Object.values(data) },
      opts
    );
  }),
  changeExchangeable: toolbox.createMethod<
    InventoryHeroCardChangeExchangeableResponseSchema,
    InventoryHeroCardChangeExchangeableRequestSchema,
    InventoryHeroCardChangeExchangeableParamsSchema,
    InventoryHeroCardChangeExchangeableQuerySchema
  >((variables, opts) =>
    api.put(
      `/api/v2/inventory/${variables.params!.userId}/cards/manage/ `,
      { action: 'change_exchangeable', cards: variables.data! },
      opts
    )
  ),
  getByTitle: toolbox.createMethod<
    InventoryHeroCardByTitleRetrieveResponseSchema,
    void,
    InventoryHeroCardByTitleParamsSchema,
    InventoryHeroCardByTitleQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.HeroCard.byTitle(variables), opts)),
  getByCharacter: toolbox.createMethod<
    InventoryHeroCardByCharacterRetrieveResponseSchema,
    void,
    InventoryHeroCardByCharacterParamsSchema,
    InventoryHeroCardByCharacterQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.HeroCard.byCharacter(variables), opts)),
  getListByUser: toolbox.createMethod<
    InventoryHeroCardByUserRetrieveResponseSchema,
    void,
    InventoryHeroCardByUserParamsSchema,
    InventoryHeroCardByUserQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.HeroCard.byUser(variables), opts)),
  getWishesListByCard: toolbox.createMethod<
    InventoryWishesByHeroCardIdResponseSchema,
    void,
    InventoryWishesByHeroCardIdParamsSchema,
    InventoryWishesByHeroCardIdQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.HeroCard.wishesByCard(variables), opts)),
  getUpgradeHistoryList: toolbox.createMethod<
    InventoryUpgradeHistoryRetrieveResponseSchema,
    void,
    InventoryUpgradeHistoryParamsSchema,
    InventoryUpgradeHistoryQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.HeroCard.upgradeHistory(variables), opts)),
  changeWishType: toolbox.createMethod<
    InventoryHeroCardChangeWishTypeResponseSchema,
    InventoryHeroCardChangeWishTypeRequestSchema,
    InventoryHeroCardChangeWishTypeParamsSchema,
    InventoryHeroCardChangeWishTypeQuerySchema
  >((variables, opts) =>
    api.post(InventoryEndpoints.HeroCard.changeWishType(variables), variables.data, opts)
  ),
  deleteWishType: toolbox.createMethod<
    InventoryHeroCardDeleteWishTypeResponseSchema,
    InventoryHeroCardDeleteWishTypeRequestSchema,
    InventoryHeroCardDeleteWishTypeParamsSchema,
    InventoryHeroCardDeleteWishTypeQuerySchema
  >((variables, opts) =>
    api.delete(InventoryEndpoints.HeroCard.wishesByCard(variables), variables.data, opts)
  ),
  getById: toolbox.createMethod<
    InventoryHeroCardByIdResponseSchema,
    void,
    InventoryHeroCardByIdParamsSchema,
    InventoryHeroCardByIdQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.HeroCard.byId(variables), opts)),
  merge: toolbox.createMethod<
    InventoryHeroCardMergeResponseSchema,
    InventoryHeroCardMergeRequestSchema,
    InventoryHeroCardMergeParamsSchema,
    InventoryHeroCardMergeQuerySchema
  >((variables, opts) =>
    api.post(InventoryEndpoints.HeroCard.merge(variables), variables.data, opts)
  ),

  catalog: toolbox.createMethod<
    InventoryHeroCardCatalogListResponseSchema,
    void,
    void,
    InventoryHeroCardCatalogQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.HeroCard.catalog(variables), opts)),
  create: toolbox.createMethod<void, InventoryHeroCardCreateRequestSchema, void, void>(
    (variables, opts) =>
      api.post(InventoryEndpoints.HeroCard.create(variables), variables.data, opts)
  ),
  update: toolbox.createMethod<
    void,
    InventoryHeroCardUpdateRequestSchema,
    InventoryHeroCardUpdateParamsSchema,
    void
  >((variables, opts) =>
    api.put(InventoryEndpoints.HeroCard.update(variables), variables.data, opts)
  ),
}));

const createCustomizationRouter = apiToolkit(({ api, toolbox }) => ({
  getList: toolbox.createMethod((variables, opts) =>
    api.get(
      InventoryEndpoints.Item.byUser({
        ...variables,
        query: { ...variables.query, type: InventoryItemType.CUSTOMIZATIONS },
      }),
      opts
    )
  ),
  set: toolbox.createMethod((variables, opts) =>
    api.post(InventoryEndpoints.Item.changeStatus(variables), variables.data, opts)
  ),
  unset: toolbox.createMethod((variables, opts) =>
    api.delete(InventoryEndpoints.Item.changeStatus(variables), variables.data, opts)
  ),
}));

const createDeckRouter = apiToolkit(({ api, toolbox }) => ({
  getList: toolbox.createMethod((variables, opts) =>
    api.get(
      InventoryEndpoints.Item.byUser({
        ...variables,
        query: { ...variables.query, type: InventoryItemType.DECKS },
      }),
      opts
    )
  ),
  open: toolbox.createMethod<
    void,
    InventoryDeckOpenRequestSchema,
    InventoryDeckOpenParamsSchema,
    void
  >((variables, opts) =>
    api.post(`/api/v2/inventory/decks/${variables.params?.id}/open/`, variables.data, opts)
  ),
}));

const createExchangeRouter = apiToolkit(({ api, toolbox }) => ({
  getListByUser: toolbox.createMethod<
    InventoryExchangeByUserRetrieveListResponseSchema,
    void,
    InventoryExchangeByUserParamsSchema,
    InventoryExchangeByUserQuerySchema
  >((variables, opts) => api.get(InventoryEndpoints.Exchange.byUser(variables), opts)),
  create: toolbox.createMethod<
    void,
    InventoryExchangeCreateRequestSchema,
    InventoryExchangeByUserParamsSchema,
    InventoryExchangeByUserQuerySchema
  >((variables, opts) =>
    api.post(InventoryEndpoints.Exchange.byUser(variables), variables.data, opts)
  ),
  changeStatus: toolbox.createMethod<
    void,
    InventoryExchangeChangeStatusRequestSchema,
    InventoryExchangeByIdParamsSchema,
    InventoryExchangeByIdQuerySchema
  >((variables, opts) =>
    api.put(InventoryEndpoints.Exchange.byId(variables), variables.data, opts)
  ),
  accept: toolbox.createMethod<
    void,
    InventoryExchangeAcceptRequestSchema,
    InventoryExchangeByIdParamsSchema,
    InventoryExchangeByIdQuerySchema
  >((variables, opts) =>
    api.put(
      InventoryEndpoints.Exchange.byId(variables),
      {
        ...variables.data,
        status: ExchangeStatus.ACCEPTED,
      },
      opts
    )
  ),
  deny: toolbox.createMethod<
    void,
    InventoryExchangeDenyRequestSchema,
    InventoryExchangeByIdParamsSchema,
    InventoryExchangeByIdQuerySchema
  >((variables, opts) =>
    api.put(
      InventoryEndpoints.Exchange.byId(variables),
      {
        ...variables.data,
        status: ExchangeStatus.DENIED,
      },
      opts
    )
  ),
}));

export namespace InventoryRepository {
  export namespace Deck {
    export const { getList, open } = createDeckRouter({ api });
  }

  export namespace Customization {
    export const { getList, set, unset } = createCustomizationRouter({ api });
  }

  export namespace HeroCard {
    export const {
      getFavoriteList,
      update,
      catalog,
      create,
      changeExchangeable,
      changeFavorite,
      getByTitle,
      getByCharacter,
      getListByUser,
      getById,
      merge,
      getWishesListByCard,
      changeWishType,
      deleteWishType,
      getUpgradeHistoryList,
    } = createHeroCardRouter({
      api,
    });
  }

  export namespace Exchange {
    export const { getListByUser, create, accept, deny, changeStatus } = createExchangeRouter({
      api,
    });
  }
}
