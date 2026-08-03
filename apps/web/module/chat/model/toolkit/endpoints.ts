import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import { publicEnv } from '~shared/utils/env';
import { UrlBuilder } from '~shared/utils/url-formatter';

import { ChannelSchema } from '../types';
import {
  ChannelByIdParamsSchema,
  ChannelMessagesPaginatedListParamsSchema,
  ChannelMessagesPaginatedListQuerySchema,
  CreateChannelQuerySchema,
  GetMessageByIdParamsSchema,
  GetPrivateChatWithUserParamsSchema,
  GetPrivateChatWithUserQuerySchema,
} from './types';

export namespace ChatEndpoints {
  /** Base API path for all chat operations */
  export const CHAT_BASE = `/api/v2/chat`;
  export const CHANNEL_BASE = `${CHAT_BASE}/rooms`;
  export const CHANNEL_BY_ID = (id: number) => `${CHANNEL_BASE}/${id}`;

  /**
   * WebSocket endpoint
   * Establishes a real-time WebSocket connection for a specific channel
   *
   * @param channelId - The channel directory identifier
   * @param query - Optional query parameters
   * @returns WebSocket URL for real-time messaging
   */
  export const ws = publicEnv('CHAT_WS_URL');
  // new UrlBuilder(`wss://sempai.redocker.io/chat/${channelDir}/`).query(query).build();

  /**
   * Channel namespace
   * Contains endpoint builders for channel operations (listing, creating, updating, deleting)
   */
  export namespace Channel {
    export const list: ToolkitEndpointBuilder<never, ChannelSchema[]> = ({ query }) =>
      new UrlBuilder(`${CHANNEL_BASE}/`).query(query).build();

    export const getPrivateChatWithUser: ToolkitEndpointBuilder<
      GetPrivateChatWithUserParamsSchema,
      GetPrivateChatWithUserQuerySchema
    > = ({ params, query }) =>
      new UrlBuilder(`${CHANNEL_BASE}/private/${params?.userId}/`).query(query).build();

    export const create: ToolkitEndpointBuilder<void, CreateChannelQuerySchema> = ({ query }) =>
      new UrlBuilder(`${CHANNEL_BASE}/`).query(query).build();

    export const remove: ToolkitEndpointBuilder<ChannelByIdParamsSchema, void> = ({ params }) =>
      new UrlBuilder(`${CHANNEL_BASE}/${params?.channelId}/`).build();

    export const change: ToolkitEndpointBuilder<ChannelByIdParamsSchema, void> = ({ params }) =>
      new UrlBuilder(`${CHANNEL_BASE}/${params?.channelId}/`).build();

    export const byId: ToolkitEndpointBuilder<ChannelByIdParamsSchema, void> = ({ params }) =>
      new UrlBuilder(`${CHANNEL_BASE}/${params?.channelId}/`).build();

    export const leave: ToolkitEndpointBuilder<ChannelByIdParamsSchema, void> = ({
      params: { channelId } = {},
    }) => new UrlBuilder(`${CHANNEL_BASE}/${channelId}/members/me/`).build();
  }

  /**
   * Member namespace
   * Contains endpoint builders for channel membership operations
   */
  export namespace Member {
    export const invite: ToolkitEndpointBuilder<ChannelByIdParamsSchema, void> = ({
      params: { channelId } = {},
    }) => new UrlBuilder(`${CHANNEL_BASE}/${channelId}/members/`).build();

    export const change: ToolkitEndpointBuilder<ChannelByIdParamsSchema, void> = ({
      params: { channelId } = {},
    }) => new UrlBuilder(`${CHANNEL_BASE}/${channelId}/members/`).build();

    export const remove: ToolkitEndpointBuilder<ChannelByIdParamsSchema, void> = ({
      params: { channelId } = {},
    }) => new UrlBuilder(`${CHANNEL_BASE}/${channelId}/members/`).build();
  }

  /**
   * Messages namespace
   * Contains endpoint builders for chat message operations
   */
  export namespace Messages {
    export const list: ToolkitEndpointBuilder<
      ChannelMessagesPaginatedListParamsSchema,
      ChannelMessagesPaginatedListQuerySchema
    > = ({ params, query }) =>
      new UrlBuilder(`${CHAT_BASE}/messages/`)
        .query({ room_id: params?.channelId, ...query })
        .build();

    export const byUuid: ToolkitEndpointBuilder<GetMessageByIdParamsSchema, void> = ({
      params: { messageUuid } = {},
      query,
    }) => new UrlBuilder(`${CHAT_BASE}/messages/${messageUuid}/`).query(query).build();
  }

  export namespace Upload {
    export const file: ToolkitEndpointBuilder<never, void> = () =>
      new UrlBuilder(`${CHAT_BASE}/messages/attach/`).build();
  }
}
