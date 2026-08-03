import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import type { UserSchemaFragment } from '~shared/api/models/user';
import type { PaginationQuerySchema } from '~shared/types/buisines';

export type ActivityTargetQuerySchema =
  | CollectionCommentTarget
  | MomentCommentTarget
  | ForumPostCommentTarget
  | TitleCommentTarget
  | ReplyCommentTarget
  | NotificationCommentTarget
  | ProfileCommentsTarget
  | UserCommentsTarget
  | PublisherCommentTarget;

export type ActivityCountQuery = number | ActivityTargetQuerySchema;

export type CommentOrdering = 'id' | '-id' | 'score' | '-score';

export interface ActivityItemParamsSchema {
  commentId: number | string;
}

export interface ActivityPaginatedListBaseQuerySchema extends Partial<PaginationQuerySchema> {
  ordering?: CommentOrdering;
}

export interface ActivityPaginatedListResponseSchema extends V2ListResponse<Activity> {}

export interface UserActivityPaginatedListResponseSchema
  extends V2ListResponse<ProfileCommentSchema> {}

export interface PublisherActivityPaginatedListResponseSchema
  extends V2ListResponse<PublisherCommentSchema> {}

export type ActivityPaginatedListQuerySchema<T extends ActivityTargetQuerySchema> =
  ActivityPaginatedListBaseQuerySchema & T;
export type UserActivityPaginatedListQuerySchema = ActivityPaginatedListBaseQuerySchema;
export type UserActivityPaginatedListParamsSchema = UserCommentsTarget;

export type PublisherActivityPaginatedListQuerySchema = ActivityPaginatedListBaseQuerySchema;
export type PublisherActivityPaginatedListParamsSchema = PublisherCommentTarget;

export interface RetrieveActivityParamsSchema {
  commentId: number | string;
}

export type QueryFn = <T extends ActivityTargetQuerySchema>(
  variables: EndpointMeta<void, ActivityPaginatedListQuerySchema<T>>
) => Promise<ActivityPaginatedListResponseSchema>;

export type QueryOneFn = (query: ActivityTargetQuerySchema) => Promise<Activity>;

export interface ForumPostCommentTarget {
  post_id?: NumberIsomorphic;
}

export interface CollectionCommentTarget {
  collection_id?: NumberIsomorphic;
}

export interface MomentCommentTarget {
  moment_id?: NumberIsomorphic;
}

export interface TitleCommentTarget {
  title_id?: NumberIsomorphic;
  chapter_id?: number;
  chapter_page?: number;
}

export interface PublisherCommentTarget {
  publisher_id: NumberIsomorphic;
}

export interface ReplyCommentTarget {
  reply_to: number;
}

export interface NotificationCommentTarget {
  id: NumberIsomorphic;
}

export interface UserCommentsTarget {
  user_id: NumberIsomorphic;
}

export interface ProfileCommentsTarget {
  profile_id: NumberIsomorphic;
}

export interface PostCommentsTarget {
  post_id: NumberIsomorphic;
}

export type Activity =
  | CommentSchema
  | ProfileCommentSchema
  | PublisherCommentSchema
  | (PostCommentsTarget & CommentSchema);

export interface CommentSchema {
  id: number;
  text: string;
  count_replies: number;
  date: number | string;
  score: number;
  is_spoiler: boolean;
  is_pinned: boolean;
  rank: string;
  user: CommentUser;
  rated: number | null;
  left_by: { id: number; name: string } | null;
}

export interface ProfileCommentSchema extends CommentSchema {
  chapter_id: number;
  reply_to_id: number;
  type: number;
  title: CommentTitle;
  page: number;
  is_deleted: boolean;
  is_blocked: boolean;
}

export interface PublisherCommentSchema extends ProfileCommentSchema {
  chapter?: {
    id: number;
    branch: number;
    index: number;
    tome: number;
    chapter: number;
    name: string;
    dir: string;
    score: number;
  };
}

export type CommentUser = UserSchemaFragment;

export type CommentTitle = Pick<TitleSchemaFragment, 'main_name' | 'dir' | 'cover'>;

export interface LikeCommentRequestSchema {
  comment: NumberIsomorphic;
  type: number | null;
}
