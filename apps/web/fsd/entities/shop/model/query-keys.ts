import type {
  DeckRetrieveParamsSchema,
  DecksListPaginatedListQuerySchema,
  OrderPaginatedListQuerySchema,
  OrderShopByIdParamsSchema,
  ShopItemByIdParamsSchema,
  ShopItemDirParamsSchema,
  ShopPaginatedListQuerySchema,
  ThemeRetrieveParamsSchema,
} from '~shared/api/models/shop';
import { queryKit } from '~shared/api/react-query';

export namespace ShopQueryKeys {
  export namespace ShopCatalog {
    export const UNIQUE_PART = 'shop-list';
    export const list = queryKit.createQueryKey<never, ShopPaginatedListQuerySchema>(
      (variables) => [UNIQUE_PART, { authDepend: true, ...variables }]
    );
    export type QueryType = ReturnType<typeof list>;
    export type Params = ShopPaginatedListQuerySchema;
  }
  export namespace ShopItem {
    export const UNIQUE_PART = 'shop-item';
    export const byDir = queryKit.createQueryKey<ShopItemDirParamsSchema, never>((variables) => [
      UNIQUE_PART,
      { authDepend: true, ...variables },
    ]);
    export const byId = queryKit.createQueryKey<ShopItemDirParamsSchema, never>((variables) => [
      UNIQUE_PART,
      { authDepend: true, ...variables },
    ]);
    export type QueryType = ReturnType<typeof byDir>;
  }

  export namespace Deck {
    export const list = queryKit.createQueryKey<void, DecksListPaginatedListQuerySchema>(
      (variables) => ['deck-list', variables]
    );
    export const byId = queryKit.createQueryKey<DeckRetrieveParamsSchema, void>((variables) => [
      'deck-detail',
      variables,
    ]);
  }

  export namespace Theme {
    export const byDir = queryKit.createQueryKey<ThemeRetrieveParamsSchema, void>((variables) => [
      'theme-detail',
      variables,
    ]);
  }

  export namespace Order {
    export namespace List {
      export const UNIQUE_PART = 'shop-orders-list';
      export const get = queryKit.createQueryKey<
        ShopItemByIdParamsSchema,
        OrderPaginatedListQuerySchema
      >((variables) => [UNIQUE_PART, { authDepend: true, ...variables }]);
    }
    export namespace Item {
      export const UNIQUE_PART = 'orders-item';
      export const get = queryKit.createQueryKey<OrderShopByIdParamsSchema, never>((variables) => [
        UNIQUE_PART,
        { authDepend: true, ...variables },
      ]);
    }
  }
}
