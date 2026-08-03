import { CreatorEndpoints } from '~entities/creator/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  CreateCreatorRequestSchema,
  CreatorRetrieveParamsSchema,
  CreatorRetrieveResponseSchema,
  UpdateCreatorParamsSchema,
  UpdateCreatorRequestSchema,
} from '~shared/api/models/creator';
import { sanitizeAsync } from '~shared/lib/sanitize/sanitize-async';

const createCreatorRouter = apiToolkit(({ api, toolbox }) => ({
  getCreator: toolbox.createMethod<
    CreatorRetrieveResponseSchema,
    void,
    CreatorRetrieveParamsSchema,
    void
  >((variables, opts) =>
    api.get(CreatorEndpoints.creator(variables), opts).then(async (v) => ({
      ...v,
      description: await sanitizeAsync(v.description),
    }))
  ),
  updateCreator: toolbox.createMethod<
    void,
    UpdateCreatorRequestSchema,
    UpdateCreatorParamsSchema,
    void
  >((variables, opts) => api.put(CreatorEndpoints.updateCreator(variables), variables.data, opts)),
  createCreator: toolbox.createMethod<void, CreateCreatorRequestSchema, void, void>(
    (variables, opts) => api.post(CreatorEndpoints.createCreator(), variables.data, opts)
  ),
}));

export namespace CreatorRepository {
  export const { getCreator, updateCreator, createCreator } = createCreatorRouter({ api });
}
