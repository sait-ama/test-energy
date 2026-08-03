import type { EmojiSchema } from '~shared/api/models/shop';
import type {
  imgSizes,
  PaginationQuerySchema,
  PaginationResponse,
  ResponseResults,
} from '~shared/types/buisines';

import { UserSchemaFragment } from './common';

export enum FriendsShipStatusEnum {
  WAITING = 'wait',
  ACCEPTED = 'friends',
  NO_FRIENDS = 'no_friends',
}
//* `1` - На рассмотрении
// * `2` - Принят
// * `3` - Отклонен
// * `4` - Отменен
export enum FriendRequestStatusEnum {
  WAITING = 1,
  ACCEPTED,
  CANCELED_BY_TO,
  CANCELED_BY_FROM,
}

export type FriendStatus = FriendsShipStatusEnum | null;
export interface FriendShipStatus {
  id: number;
  name: string;
  emoji: EmojiSchema | null;
}
export interface FriendShipSchema {
  id: number;
  username: string;
  avatar: Record<imgSizes, string>;
  tagline: string;
  status: FriendShipStatus | null;
  frame: Record<imgSizes, string>;
  created_at: string;
}

export interface FriendshipPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface FriendshipSearchPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  query?: string;
}

export interface FriendshipPaginatedListParamsSchema {
  userId: NumberIsomorphic;
}

export interface RemoveFriendshipParamsSchema {
  userId: NumberIsomorphic;
  friendId: NumberIsomorphic;
}

export interface FriendRequestUserSchema extends Omit<FriendShipSchema, 'created_at' | ''> {}

export interface FriendRequestSchema {
  id: number;
  status: FriendRequestStatusEnum;
  message: string;
  date: string;
  from_user: FriendRequestUserSchema;
  to_user: FriendRequestUserSchema;
}

export interface FriendRequestPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface FriendRequestPaginatedListParamsSchema {
  userId: NumberIsomorphic;
}

export interface FriendRequestPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<FriendRequestSchema[]> {}

export interface FriendShipPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<FriendShipSchema[]> {}

export interface FriendSearchPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<UserSchemaFragment[]> {}

export interface CreateFriendRequestSchema {
  user_id: number;
  to_user: number;
  message?: string;
}

export interface CreateFriendshipRequestParamsSchema {
  userId: NumberIsomorphic;
}

export interface UpdateFriendRequestParamsSchema {
  user_id: number;
  requestId: number;
}

export interface UpdateFriendRequestResponseSchema
  extends Omit<FriendRequestSchema, 'to_user' | 'from_user'> {
  to_user: number;
  from_user: number;
}

export interface UpdateFriendRequestQuerySchema {
  status?: FriendRequestStatusEnum;
  message?: string;
  to_user: number;
}
export interface UpdateFriendShipStatusParamsSchema {
  friend_id: NumberIsomorphicV2;
  user_id: NumberIsomorphicV2;
}
export interface UpdateFriendShipStatusRequestSchema {
  status: number; // from /forms/friends/status getFormBase
}
export interface UpdateFriendShipStatusResponseSchema {
  status: number; // from /forms/friends/status getFormBase
  id: number;
}
