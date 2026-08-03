import type { QueryKey } from '@tanstack/react-query';

import type {
  InventoryCustomizationParamsSchema,
  InventoryCustomizationQuerySchema,
  InventoryDeckParamsSchema,
  InventoryDeckQuerySchema,
  InventoryHeroCardByIdParamsSchema,
  InventoryHeroCardByIdQuerySchema,
  InventoryHeroCardByTitleParamsSchema,
  InventoryHeroCardByTitleQuerySchema,
  InventoryHeroCardByUserParamsSchema,
  InventoryHeroCardByUserQuerySchema,
  InventoryHeroCardFavoriteParamsSchema,
  InventoryHeroCardFavoriteQuerySchema,
  InventoryUpgradeHistoryParamsSchema,
  InventoryUpgradeHistoryQuerySchema,
} from '~shared/api/models/inventory';
import { queryKit } from '~shared/api/react-query';

export namespace InventoryKeys {
  export const customizationItem = queryKit.createQueryKey<
    InventoryCustomizationParamsSchema,
    InventoryCustomizationQuerySchema
  >((variables) => ['customization-item', variables]);

  export const decks = queryKit.createQueryKey<InventoryDeckParamsSchema, InventoryDeckQuerySchema>(
    (variables) => ['decks', variables]
  );

  export const favoriteCard = queryKit.createQueryKey<
    InventoryHeroCardFavoriteParamsSchema,
    InventoryHeroCardFavoriteQuerySchema
  >((variables) => ['favorite-card', variables]);

  export const exchange = (params) => ['exchange', { params }] satisfies QueryKey;
  export const cardById = queryKit.createQueryKey<
    InventoryHeroCardByIdParamsSchema,
    InventoryHeroCardByIdQuerySchema
  >((variables) => ['card', variables]);
  export const catalog = queryKit.createQueryKey<
    InventoryHeroCardByIdParamsSchema,
    InventoryHeroCardByIdQuerySchema
  >((variables) => ['card-catalog', variables]);
  export const cardByUser = queryKit.createQueryKey<
    InventoryHeroCardByUserParamsSchema,
    InventoryHeroCardByUserQuerySchema
  >((variables) => ['card-list', variables]);
  export const cardByTitle = queryKit.createQueryKey<
    InventoryHeroCardByTitleParamsSchema,
    InventoryHeroCardByTitleQuerySchema
  >((variables) => ['title-card-list', variables]);

  export const wishesByCard = queryKit.createQueryKey<
    InventoryHeroCardByTitleParamsSchema,
    InventoryHeroCardByTitleQuerySchema
  >((variables) => ['wishes-card-list', variables]);

  export const upgradeHistory = queryKit.createQueryKey<
    InventoryUpgradeHistoryParamsSchema,
    InventoryUpgradeHistoryQuerySchema
  >((variables) => ['wishes-card-list', variables]);
}
