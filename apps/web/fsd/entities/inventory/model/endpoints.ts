import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import {
  InventoryExchangeByIdParamsSchema,
  InventoryExchangeByIdQuerySchema,
  InventoryHeroCardByCharacterParamsSchema,
  InventoryHeroCardByCharacterQuerySchema,
  InventoryHeroCardByIdParamsSchema,
  InventoryHeroCardByIdQuerySchema,
  InventoryHeroCardByTitleParamsSchema,
  InventoryHeroCardByTitleQuerySchema,
  InventoryHeroCardByUserParamsSchema,
  InventoryHeroCardByUserQuerySchema,
  InventoryHeroCardCatalogQuerySchema,
  InventoryHeroCardChangeWishTypeParamsSchema,
  InventoryHeroCardChangeWishTypeQuerySchema,
  InventoryHeroCardFavoriteParamsSchema,
  InventoryHeroCardFavoriteQuerySchema,
  InventoryHeroCardMergeParamsSchema,
  InventoryHeroCardMergeQuerySchema,
  InventoryHeroCardUpdateParamsSchema,
  InventoryItemByUserParamsSchema,
  InventoryItemByUserQuerySchema,
  InventoryUpgradeHistoryParamsSchema,
  InventoryUpgradeHistoryQuerySchema,
  InventoryWishesByHeroCardIdParamsSchema,
  InventoryWishesByHeroCardIdQuerySchema,
} from '~shared/api/models/inventory';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace InventoryEndpoints {
  export namespace Item {
    export const byUser: ToolkitEndpointBuilder<
      InventoryItemByUserParamsSchema,
      InventoryItemByUserQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/v2/inventory/${variables.params?.userId}/`)
        .query(variables.query)
        .build();

    export const changeStatus: ToolkitEndpointBuilder<
      InventoryItemByUserParamsSchema,
      InventoryItemByUserQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/inventory/${variables.params?.userId}/`).query(variables.query).build();
  }

  export namespace HeroCard {
    export const byUser: ToolkitEndpointBuilder<
      InventoryHeroCardByUserParamsSchema,
      InventoryHeroCardByUserQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/v2/inventory/${variables.params?.userId}/`)
        .query({ type: 'cards', ...variables.query })
        .build();

    export const wishesByCard: ToolkitEndpointBuilder<
      InventoryWishesByHeroCardIdParamsSchema,
      InventoryWishesByHeroCardIdQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/v2/inventory/wishes/${variables.params?.cardId}/`)
        .query(variables.query)
        .build();

    export const changeWishType: ToolkitEndpointBuilder<
      InventoryHeroCardChangeWishTypeParamsSchema,
      InventoryHeroCardChangeWishTypeQuerySchema
    > = (variables) => new UrlBuilder(`/api/v2/inventory/wishes/`).query(variables.query).build();

    export const upgradeHistory: ToolkitEndpointBuilder<
      InventoryUpgradeHistoryParamsSchema,
      InventoryUpgradeHistoryQuerySchema
    > = (variables) => new UrlBuilder(`/api/v2/inventory/upgrades/`).query(variables.query).build();

    export const byTitle: ToolkitEndpointBuilder<
      InventoryHeroCardByTitleParamsSchema,
      InventoryHeroCardByTitleQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/inventory/${variables.params?.titleId}/cards/`)
        .query(variables.query)
        .build();

    export const byCharacter: ToolkitEndpointBuilder<
      InventoryHeroCardByCharacterParamsSchema,
      InventoryHeroCardByCharacterQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/inventory/character/${variables.params!.characterId}/cards/`)
        .query(variables.query)
        .build();

    export const merge: ToolkitEndpointBuilder<
      InventoryHeroCardMergeParamsSchema,
      InventoryHeroCardMergeQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/inventory/${variables.params!.userId}/cards/merge/`)
        .query(variables.query)
        .build();

    export const byId: ToolkitEndpointBuilder<
      InventoryHeroCardByIdParamsSchema,
      InventoryHeroCardByIdQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/inventory/cards/${variables.params!.cardId}/`)
        .query(variables.query)
        .build();

    export const favorite: ToolkitEndpointBuilder<
      InventoryHeroCardFavoriteParamsSchema,
      InventoryHeroCardFavoriteQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/v2/users/${variables.params!.userId}/favorite-cards/`)
        .query(variables.query)
        .build();
    export const catalog: ToolkitEndpointBuilder<void, InventoryHeroCardCatalogQuerySchema> = (
      variables
    ) => new UrlBuilder(`/api/inventory/catalog/`).query(variables.query).build();
    export const create: ToolkitEndpointBuilder<void, void> = (variables) =>
      new UrlBuilder(`/api/inventory/cards/`).query(variables.query).build();
    export const update: ToolkitEndpointBuilder<InventoryHeroCardUpdateParamsSchema, void> = (
      variables
    ) =>
      new UrlBuilder(`/api/inventory/cards/${variables.params!.cardId}/`)
        .query(variables.query)
        .build();
  }

  export namespace Exchange {
    export const byUser: ToolkitEndpointBuilder<
      InventoryHeroCardByUserParamsSchema,
      InventoryHeroCardByUserQuerySchema
    > = (variables) =>
      new UrlBuilder(`/api/v2/inventory/${variables.params!.userId}/exchanges/`)
        .query(variables.query)
        .build();

    export const byId: ToolkitEndpointBuilder<
      InventoryExchangeByIdParamsSchema,
      InventoryExchangeByIdQuerySchema
    > = (variables) =>
      new UrlBuilder(
        `/api/v2/inventory/${variables.params!.userId}/exchanges/${variables.params!.exchangeId}/`
      )
        .query(variables.query)
        .build();
  }
}
