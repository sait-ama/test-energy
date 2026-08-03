import type { SubContentType } from '~shared/api/models/user-subscriptions';
import type { PaginationQuerySchema, ResponseResults } from '~shared/types/buisines';

import type { UserSchemaFragment } from './user';

export type FollowerSchema = UserSchemaFragment;
export type FollowerOrdering = 'id' | '-id';

export interface FollowersPaginatedListQuerySchema extends PaginationQuerySchema {
  id: number;
  ordering?: FollowerOrdering;
  sub_type: SubContentType;
}

export interface FollowersPaginatedListResponseSchema
  extends ResponseResults<FollowerSchema[], never, never> {}
