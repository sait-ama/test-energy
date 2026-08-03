import type { PublisherSchemaFragment } from '~shared/api/models/publisher';
import { TitleSchemaFragment } from '~shared/api/models/title';
import type { UserSchemaFragment } from '~shared/api/models/user';
import type { DetailServerErrors } from '~shared/lib/error-handling';
import type { PaginationQuerySchema, ResponseResults } from '~shared/types/buisines';

export type SubContentType =
  | 'author_users'
  | 'author_publishers'
  | 'titles_publishers'
  | 'title_cards';

export type SubscriptionAsUser = UserSchemaFragment;
export type SubscriptionAsTitle = TitleSchemaFragment;
export type SubscriptionAsPublisher = PublisherSchemaFragment;

export type SubscriptionSchema = SubscriptionAsUser | SubscriptionAsPublisher;

export interface UserSubscriptionsPaginatedListQuerySchema extends PaginationQuerySchema {
  ordering?: '-id' | 'id';
  user_id: number;
  sub_type: string;
}

export interface UserSubscriptionsPaginatedListResponseSchema
  extends ResponseResults<
    (SubscriptionAsUser | SubscriptionAsPublisher)[],
    never,
    DetailServerErrors
  > {}

//put
export interface UpdateSubscriptionRequestSchema {
  author_users?: number[];
  author_publishers?: number[];
  titles_publishers?: number[];
  operation: 'add' | 'remove';
}

export interface UpdateSubscriptionResponseSchema {
  detail?: {
    author_users?: string[];
    author_publishers?: string[];
    titles_publishers?: string[];
  };
}
