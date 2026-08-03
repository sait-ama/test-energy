import { DefaultError } from '@tanstack/react-query';

import { PaginationQuerySchema, ResponseResults } from '~shared/types/buisines';

import { ChannelSchema, ChannelType, MessageSchema, RoleChatUser } from '../types';

export interface ChannelByIdParamsSchema {
  channelId: number;
}

export interface MessagesByChannelIdParamsSchema {
  channelId: NumberIsomorphicV2;
}

export type GetMessagesPaginatedListQuerySchema = PaginationQuerySchema & { search?: string };

export interface GetChannelsPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  query?: string;
  queryBy?: 'friends' | 'messages' | 'groups';
  name?: string;
}

export interface GetPrivateChatWithUserParamsSchema {
  userId: number;
}

export interface GetPrivateChatWithUserQuerySchema {}

export interface GetOrCreateChatWithUserParamsSchema extends GetPrivateChatWithUserParamsSchema {}

export interface GetOrCreateChatWithUserQuerySchema extends GetPrivateChatWithUserQuerySchema {}

/**
 * Query schema for channel creation endpoint
 */
export interface CreateChannelQuerySchema {}

export interface GetMessageByIdParamsSchema {
  messageUuid: string;
}

export type ChannelPaginatedListResponseSchema<T = ChannelSchema> = ResponseResults<
  T[],
  never,
  unknown
>;

export type MessagePaginatedListResponseSchema<T = MessageSchema> = ResponseResults<
  T[],
  never,
  unknown
>;

export interface ChannelManipBaseRequestSchema {
  name?: string;
  cover?: File;
  member_ids?: number[];
}

export type CreateChannelRequestSchema = ChannelManipBaseRequestSchema & {
  type: ChannelType;
};
export type ChangeChannelRequestSchema = ChannelManipBaseRequestSchema & {};
export type DeleteChannelRequestSchema = ChannelManipBaseRequestSchema & {};

export interface ChannelManipBaseResponseSchema extends ChannelSchema {}

export type CreateChannelResponseSchema = ChannelManipBaseResponseSchema & {};
export type ChangeChannelResponseSchema = CreateChannelResponseSchema & {};
export type DeleteChannelResponseSchema = CreateChannelResponseSchema & {};

// New cursor-based pagination query schema
export interface CursorPaginationQuerySchema {
  cursor?: string;
  limit?: number;
}

// Update to use cursor-based pagination
export type ChannelMessagesPaginatedListQuerySchema = CursorPaginationQuerySchema & {
  created_at__lt?: string;
  created_at__gt?: string;
  created_at__lte?: string;
  created_at__gte?: string;
};
export type ChannelMessagesPaginatedListParamsSchema = MessagesByChannelIdParamsSchema;

export type ChannelMessagesPaginatedListResponseSchema<T = MessageSchema> = ResponseResults<
  T[],
  never,
  DefaultError
>;

export type UpdateMemberResponseSchema = string;

export interface UpdateMemberRequestSchema {
  user_ids: number[];
  role: RoleChatUser;
}

export interface RemoveMemberRequestSchema {
  user_ids: number[];
}

export interface UpdateMessageRequestSchema {
  text: string;
  mentioned_users?: number[];
  attachments?: number[];
}

export interface UpdateMessageResponseSchema {}

export interface CreateMessageParamsSchema {}

export interface CreateMessageRequestSchema {
  text: string;
  local_uuid: string;
  attachments?: number[];
  mentioned_users?: number[];
  reply_to?: string;
  room_id: number;
}

export interface WebSocketRequestSchema extends CreateMessageRequestSchema {
  type: string; // Тип сообщения, которое отправляется на сервер
}
