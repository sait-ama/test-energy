import { Post } from '@re/api/generated/types.gen';

import type { UserSchemaFragment } from '~shared/api/models/user';
import type { ResponseResults } from '~shared/types/buisines';

import { RatedStatus, RatedStatusType } from './common';

export { RatedStatus, type RatedStatusType };

type V2PostSchema = Post;

export type PostSchema = V2PostSchema;

export type OrderingSorts = 'id' | '-id' | 'score' | '-score' | 'week';
export type PostFeedPaginatedListResponseSchema = ResponseResults<PostSchema[], never>;

export enum LikeDislikeType {
  LIKE,
  DISLIKE,
}

export type UserReaction = {
  user: UserSchemaFragment;
  type: RatedStatus;
};
export type PostReactionsByDirPaginatedListResponseSchema = ResponseResults<UserReaction[]>;
