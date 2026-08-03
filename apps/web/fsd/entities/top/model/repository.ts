import { TopEndpoints } from '~entities/top/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type { TopTabsResponseSchema } from '~shared/api/models/top';

const createTopRouter = apiToolkit(({ api, toolbox }) => ({
  tabs: toolbox.createMethod<TopTabsResponseSchema, void, void, void>((_, opts) =>
    api.get(TopEndpoints.tabs(), opts)
  ),
}));

export namespace TopRepository {
  export const { tabs } = createTopRouter({ api });
}
