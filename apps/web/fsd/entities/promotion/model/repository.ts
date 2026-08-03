import { PromotionEndpoints } from '~entities/promotion/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type { PromotionsListResponseSchema } from '~shared/api/models/promotion';

const createCollectionsRouter = apiToolkit(({ api, toolbox }) => ({
  list: toolbox.createMethod<PromotionsListResponseSchema, void, void, void>((variables, opts) =>
    api.get(PromotionEndpoints.list(variables), opts)
  ),
}));

export namespace PromotionsRepository {
  export const { list } = createCollectionsRouter({ api });
}
