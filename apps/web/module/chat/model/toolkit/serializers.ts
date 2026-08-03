import { getClientDate } from '~shared/utils/get-client-date';

import {
  ChannelSchema,
  MemberJoinMessageEvent,
  MemberLeaveMessageEvent,
  MessageMessageEvent,
  MessageSchema,
  RestMessageMessageEvent,
  RestMessageSchema,
  RoomCoverChangeData,
  RoomCoverChangeMessageEvent,
  RoomEventDiscriminator,
  RoomNameChangeData,
  RoomNameChangeMessageEvent,
  RootEvent,
  WebSocketEventType,
} from '../types';
import { ChannelMessagesPaginatedListResponseSchema } from './types';

/**
 * Преобразует REST-сообщение в формат для клиента
 */
export function transformMessage(message: RestMessageSchema): MessageSchema {
  const { author_id, data, type, created_at, updated_at, ...rest } = message;

  const discriminator = type;

  const baseMessage = {
    ...rest,
    user_id: author_id,
    discriminator,
    created_at: getClientDate({ serverDateString: created_at }) ?? created_at,
    updated_at: getClientDate({ serverDateString: updated_at }) ?? updated_at,
  };

  switch (discriminator) {
    case RoomEventDiscriminator.MESSAGE:
      return {
        ...baseMessage,
        text: (data as RestMessageMessageEvent['data']).text,
        attachments: (data as RestMessageMessageEvent['data']).attachments,
        local_uuid: rest.uuid,
      } as MessageMessageEvent;

    case RoomEventDiscriminator.MEMBER_JOIN:
      return {
        ...baseMessage,
        user_id: data.id,
        user: data,
      } as unknown as MemberJoinMessageEvent;

    case RoomEventDiscriminator.MEMBER_LEAVE:
      return {
        ...baseMessage,
        user_id: (data as { id: number }).id,
      } as MemberLeaveMessageEvent;

    case RoomEventDiscriminator.ROOM_NAME_CHANGE:
      return {
        ...baseMessage,
        name: (data as RoomNameChangeData).name,
      } as RoomNameChangeMessageEvent;

    case RoomEventDiscriminator.ROOM_COVER_CHANGE:
      return {
        ...baseMessage,
        cover: (data as RoomCoverChangeData).cover,
      } as RoomCoverChangeMessageEvent;

    default:
      return {
        ...baseMessage,
        ...data,
      } as MessageSchema;
  }
}

/**
 * Преобразует список сообщений
 */
export function transformChatRoomMessageListResponse(
  data: ChannelMessagesPaginatedListResponseSchema<RestMessageSchema>
): ChannelMessagesPaginatedListResponseSchema<MessageSchema> {
  return {
    ...data,
    results: data.results.map(transformMessage),
  };
}

/**
 * Сортирует список каналов по дате последнего сообщения
 */
export function sortChannelsByLastMessageDt(data: ChannelSchema[]): ChannelSchema[] {
  return data
    .sort((a, b) => {
      const aLastMessageDt = a.last_update_dt;
      const bLastMessageDt = b.last_update_dt;
      if (!aLastMessageDt || !bLastMessageDt) return 0;
      return new Date(bLastMessageDt).getTime() - new Date(aLastMessageDt).getTime();
    })
    .map((channel) => ({
      ...channel,
      last_update_dt: channel.last_update_dt
        ? getClientDate({ serverDateString: channel.last_update_dt })?.toString()
        : channel.last_update_dt,
      last_read_dt: channel.last_read_dt
        ? getClientDate({ serverDateString: channel.last_read_dt })?.toString()
        : channel.last_read_dt,
    }));
}

function fixServerTime(event: RootEvent): RootEvent {
  const innerEvent = event.event;

  if (event.type === WebSocketEventType.USER_EVENT) {
    return event;
  }

  return {
    ...event,
    event: {
      ...innerEvent,
      // @ts-expect-error
      ...(innerEvent.created_at && {
        // @ts-expect-error
        created_at: getClientDate({ serverDateString: innerEvent.created_at })?.toString(),
      }),
    },
  };
}

export function serializeWsEvent(event: RootEvent): RootEvent {
  return fixServerTime(event);
}
