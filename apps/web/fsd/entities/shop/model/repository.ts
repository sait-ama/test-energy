import { ShopEndpoints } from '~entities/shop/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import {
  CreateShopItemRequestSchema,
  DeckRetrieveParamsSchema,
  DeckRetrieveResponseSchema,
  DecksListPaginatedListQuerySchema,
  DecksListPaginatedListResponseSchema,
  OrderPaginatedListQuerySchema,
  OrderShopByIdParamsSchema,
  ShopItemByIdParamsSchema,
  ShopItemByIdRequestSchema,
  ShopItemDirParamsSchema,
  ShopItemSchema,
  ShopPaginatedListQuerySchema,
  ShopPaginatedListResponseSchema,
  ThemeRetrieveParamsSchema,
  ThemeRetrieveResponseSchema,
  UserOrderSchema,
} from '~shared/api/models/shop';
import type { DetailServerErrorRecord } from '~shared/lib/error-handling';
import type { ResponseResults, ResponseV2Single } from '~shared/types/buisines';

const createShopRouter = apiToolkit(({ api, toolbox }) => ({
  shopFeedGetCatalog: toolbox.createMethod<
    ShopPaginatedListResponseSchema,
    void,
    void,
    ShopPaginatedListQuerySchema
  >(({ query }, opts) => api.get(ShopEndpoints.Feed.getCatalog({ query }), opts)),

  getShopItemByDir: toolbox.createMethod<
    ResponseV2Single<ShopItemSchema, never, DetailServerErrorRecord>,
    void,
    ShopItemDirParamsSchema,
    void
  >(({ params }, opts) => api.get(ShopEndpoints.Item.getByDir({ params }), opts)),
  getOrders: toolbox.createMethod<
    ResponseResults<UserOrderSchema[]>,
    void,
    void,
    OrderPaginatedListQuerySchema
  >(({ query }, opts) => api.get(ShopEndpoints.Order.list({ query }), opts)),
  getOrderById: toolbox.createMethod<
    ResponseV2Single<UserOrderSchema, never, DetailServerErrorRecord>,
    void,
    OrderShopByIdParamsSchema,
    void
  >(({ params }, opts) => api.get(ShopEndpoints.Order.getById({ params }), opts)),
  buyShopItemById: toolbox.createMethod<
    void,
    ShopItemByIdRequestSchema,
    ShopItemByIdParamsSchema,
    void
  >(({ params, data }, opts) => api.post(ShopEndpoints.Item.buyById({ params }), data, opts)),
  createShopItem: toolbox.createMethod<void, CreateShopItemRequestSchema, void, void>(
    ({ data }, opts) => api.post(ShopEndpoints.Item.createShopItem({}), data, opts)
  ),

  decksList: toolbox.createMethod<
    DecksListPaginatedListResponseSchema,
    void,
    void,
    DecksListPaginatedListQuerySchema
  >((variables, opts) => api.get(ShopEndpoints.Deck.list(variables), opts)),
  deckById: toolbox.createMethod<DeckRetrieveResponseSchema, void, DeckRetrieveParamsSchema, void>(
    (variables, opts) => api.get(ShopEndpoints.Deck.getById(variables), opts)
  ),
  themeByDir: toolbox.createMethod<
    ThemeRetrieveResponseSchema,
    void,
    ThemeRetrieveParamsSchema,
    void
  >((variables, opts) => api.get(ShopEndpoints.Theme.getByDir(variables), opts)),
}));
export namespace ShopRepository {
  export const {
    shopFeedGetCatalog,
    decksList,
    deckById,
    getShopItemByDir,
    getOrders,
    getOrderById,
    buyShopItemById,
    createShopItem,
    themeByDir,
  } = createShopRouter({
    api,
  });
}
