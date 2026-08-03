import type { Collection } from '~shared/api/generated/models';
import type { UserSchemaFragment } from '~shared/api/models/common';
import { RatedStatus } from '~shared/api/models/post';
import type { TitleSchema } from '~shared/api/models/title';
import type { PaginationQuerySchema, ResponseResults } from '~shared/types/buisines';

export type ShortTitleSchema = Pick<TitleSchema, 'dir' | 'main_name' | 'type' | 'id' | 'cover'>;
export interface CollectionSchema extends Collection {
  user?: UserSchemaFragment;
  rated: RatedStatus | null;
}

interface CollectionParam {
  collectionId: NumberIsomorphic;
}

export interface CollectionRetrieveParamsSchema extends CollectionParam {}

export type CollectionRetrieveResponseSchema = CollectionSchema;

export interface CollectionsListQuerySchema extends Partial<PaginationQuerySchema> {
  user_id?: NumberIsomorphic;
  title_id?: NumberIsomorphic;
}

export interface CollectionsListResponseSchema extends ResponseResults<CollectionSchema[]> {}
export interface CollectionUpdateCreateRequestSchema {
  name: string;
  description: string;
  cover: string;
  titles: { title: number; pos: number }[];
}
