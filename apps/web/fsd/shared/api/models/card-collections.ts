import type {
  CardCollection,
  CardCollectionList,
  V2InventoryCollectionsCreateData,
  V2InventoryCollectionsCreateResponse,
  V2InventoryCollectionsUpdateData,
  V2InventoryCollectionsUpdateResponse,
} from '~shared/api/generated/models';
import { Ordering } from '~shared/api/models/ordering';
import { PaginationQuerySchema } from '~shared/types/buisines';

export type CardCollectionPaginatedListResponseSchema = CardCollectionList;
export type CardCollectionPaginatedListParamsSchema = { user_id: NumberIsomorphic };
export type CardCollectionPaginatedListQuerySchema = {
  ordering?: Ordering | `-${Ordering}`;
} & PaginationQuerySchema;
export type CardCollectionRetrieveResponseSchema = CardCollection;
export type CardCollectionRetrieveParamsSchema = CardCollectionPaginatedListParamsSchema & {
  collection_id: NumberIsomorphic;
};
export type CreateCardCollectionRequestSchema = V2InventoryCollectionsCreateData['body'];
export type CreateCardCollectionResponseSchema = V2InventoryCollectionsCreateResponse;
export type CreateCardCollectionParamsSchema = V2InventoryCollectionsCreateData['path'];
export type UpdateCardCollectionRequestSchema = V2InventoryCollectionsUpdateData['body'];
export type UpdateCardCollectionParamsSchema = V2InventoryCollectionsUpdateData['path'];
export type UpdateCardCollectionResponseSchema = V2InventoryCollectionsUpdateResponse;
