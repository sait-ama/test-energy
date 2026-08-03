import { LatestChaptersEndpoints } from '~entities/latest-chapter/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  LatestChaptersListQuerySchema,
  LatestChaptersListResponseSchema,
} from '~shared/api/models/latest-chapter';

const createLatestChaptersRouter = apiToolkit(({ api, toolbox }) => ({
  list: toolbox.createMethod<
    LatestChaptersListResponseSchema,
    void,
    void,
    LatestChaptersListQuerySchema
  >((variables, opts) => api.get(LatestChaptersEndpoints.list(variables), opts)),
}));

export namespace LatestChaptersRepository {
  export const { list } = createLatestChaptersRouter({ api });
}
