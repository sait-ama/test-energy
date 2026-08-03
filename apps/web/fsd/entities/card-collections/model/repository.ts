import { CardCollectionEndpoints } from '~entities/card-collections/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import {
  CardCollectionPaginatedListParamsSchema,
  CardCollectionPaginatedListQuerySchema,
  CardCollectionPaginatedListResponseSchema,
  CardCollectionRetrieveParamsSchema,
  CardCollectionRetrieveResponseSchema,
  CreateCardCollectionParamsSchema,
  CreateCardCollectionRequestSchema,
  CreateCardCollectionResponseSchema,
  UpdateCardCollectionParamsSchema,
  UpdateCardCollectionRequestSchema,
  UpdateCardCollectionResponseSchema,
} from '~shared/api/models/card-collections';

const createTitleRouter = apiToolkit(({ api, toolbox }) => ({
  one: toolbox.createMethod<
    CardCollectionRetrieveResponseSchema,
    void,
    CardCollectionRetrieveParamsSchema,
    void
  >((variables, opts) => api.get(CardCollectionEndpoints.one(variables), opts)),
  create: toolbox.createMethod<
    CreateCardCollectionResponseSchema,
    CreateCardCollectionRequestSchema,
    CreateCardCollectionParamsSchema,
    void
  >((variables, opts) => api.post(CardCollectionEndpoints.create(variables), variables.data, opts)),
  list: toolbox.createMethod<
    CardCollectionPaginatedListResponseSchema,
    void,
    CardCollectionPaginatedListParamsSchema,
    CardCollectionPaginatedListQuerySchema
  >((variables, opts) => api.get(CardCollectionEndpoints.list(variables), opts)),
  remove: toolbox.createMethod<void, void, UpdateCardCollectionParamsSchema, void>(
    (variables, opts) => api.delete(CardCollectionEndpoints.update(variables), {}, opts)
  ),
  update: toolbox.createMethod<
    UpdateCardCollectionResponseSchema,
    UpdateCardCollectionRequestSchema,
    UpdateCardCollectionParamsSchema,
    void
  >((variables, opts) => api.put(CardCollectionEndpoints.update(variables), variables.data, opts)),
}));
const router = createTitleRouter({ api });
export namespace CardCollectionsRepository {
  export const { one, create, update, list, remove } = router;
}
