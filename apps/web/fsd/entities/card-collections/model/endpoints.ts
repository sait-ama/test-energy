import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type {
  CardCollectionPaginatedListParamsSchema,
  CardCollectionPaginatedListQuerySchema,
  CardCollectionRetrieveParamsSchema,
  CreateCardCollectionParamsSchema,
  UpdateCardCollectionParamsSchema,
} from '~shared/api/models/card-collections';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace CardCollectionEndpoints {
  export const list: ToolkitEndpointBuilder<
    CardCollectionPaginatedListParamsSchema,
    CardCollectionPaginatedListQuerySchema
  > = ({ params: { user_id } = {}, query }) =>
    new UrlBuilder(`/api/v2/inventory/${user_id}/collections/`).query(query).build();
  export const one: ToolkitEndpointBuilder<CardCollectionRetrieveParamsSchema, void> = ({
    params: { user_id, collection_id } = {},
  }) => `/api/v2/inventory/${user_id}/collections/${collection_id}/`;
  export const create: ToolkitEndpointBuilder<CreateCardCollectionParamsSchema, void> = ({
    params: { user_id } = {},
  }) => `/api/v2/inventory/${user_id}/collections/`;
  export const update: ToolkitEndpointBuilder<UpdateCardCollectionParamsSchema, void> = ({
    params: { user_id, collection_id } = {},
  }) => `/api/v2/inventory/${user_id}/collections/${collection_id}/`;
}
