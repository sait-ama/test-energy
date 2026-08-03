import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import {
  DeckRetrieveParamsSchema,
  DecksListPaginatedListQuerySchema,
  OrderPaginatedListQuerySchema,
  OrderShopByIdParamsSchema,
  ShopItemByIdParamsSchema,
  ShopItemDirParamsSchema,
  ShopPaginatedListQuerySchema,
  ThemeRetrieveParamsSchema,
} from '~shared/api/models/shop';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace ShopEndpoints {
  export namespace Order {
    export const list: ToolkitEndpointBuilder<never, OrderPaginatedListQuerySchema> = ({ query }) =>
      new UrlBuilder(`/api/v2/shop/orders/`).query(query).build();
    export const getById: ToolkitEndpointBuilder<OrderShopByIdParamsSchema, void> = ({
      params: { orderId = undefined } = {},
    }) => new UrlBuilder(`/api/v2/shop/orders/${orderId}/`).build();
  }

  export namespace Deck {
    export const list: ToolkitEndpointBuilder<void, DecksListPaginatedListQuerySchema> = ({
      query,
    }) => new UrlBuilder('/api/v2/shop/decks/').query(query).build();
    export const getById: ToolkitEndpointBuilder<DeckRetrieveParamsSchema, void> = ({ params }) =>
      new UrlBuilder(`/api/v2/shop/decks/${params?.deckId}/`).build();
  }

  export namespace Item {
    export const createShopItem: ToolkitEndpointBuilder<never, never> = () =>
      new UrlBuilder(`/api/v2/shop/`).build();
    export const buyById: ToolkitEndpointBuilder<ShopItemByIdParamsSchema, never> = ({
      params: { shopItemId = undefined } = {},
    }) => new UrlBuilder(`/api/v2/shop/buy/${shopItemId}/`).build();
    export const getByDir: ToolkitEndpointBuilder<ShopItemDirParamsSchema, never> = ({
      params: { shopItemDir = undefined } = {},
    }) => new UrlBuilder(`/api/v2/shop/${shopItemDir}/`).build();
  }

  export namespace Theme {
    export const getByDir: ToolkitEndpointBuilder<ThemeRetrieveParamsSchema, never> = ({
      params: { themeDir } = {},
    }) => new UrlBuilder(`/api/v2/shop/${themeDir}/`).build();
  }

  export namespace Feed {
    export const getCatalog: ToolkitEndpointBuilder<never, ShopPaginatedListQuerySchema> = ({
      query,
    }) => new UrlBuilder(`/api/v2/shop/`).query(query).build();
  }
}
