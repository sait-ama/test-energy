import { UserSchema as UserSchemaSharedType } from '~shared/api/models/user';

export enum ChannelType {
  PRIVATE = 'private',
  GROUP = 'group',
  GUILD = 'guild',
}

export enum RoleChatUser {
  CREATOR = 'creator',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export enum WebSocketEventType {
  ROOM_EVENT = 'room_event',
  USER_EVENT = 'user_event',
}

export enum RoomEventDiscriminator {
  MEMBER_JOIN = 'member_join',
  MEMBER_LEAVE = 'member_leave',
  MEMBER_ONLINE = 'member_online',
  MEMBER_OFFLINE = 'member_offline',
  ROOM_NAME_CHANGE = 'room_name_change',
  ROOM_COVER_CHANGE = 'room_cover_change',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  MESSAGE = 'message',
  MESSAGE_UPDATE = 'message_update',
  MESSAGE_DELETE = 'message_delete',
  // CUSTOM FRONT_END ONLY EVENTS
  MARK_READ = 'mark_read',
}

export enum UserEventDiscriminator {
  JOIN = 'join',
  LEAVE = 'leave',
}

export const RoleChatUserLabel = {
  [RoleChatUser.CREATOR]: 'Создатель',
  [RoleChatUser.MEMBER]: 'Участник',
  [RoleChatUser.MODERATOR]: 'Модератор',
};

export type MessageUserSchema = Pick<
  UserSchemaSharedType,
  'id' | 'username' | 'is_staff' | 'avatar' | 'frame' | 'is_staff'
> & {
  role: RoleChatUser;
};

export type ChannelMemberSchema = MessageUserSchema & {
  role: RoleChatUser;
  is_deleted: boolean;
};

export type AttachmentSchema = {
  media_type: 'image';
  extension: string;
  width: number;
  height: number;
  url: string;
  is_original: boolean;
};

export type ChannelSchema = {
  id: number;
  name: string;
  type: ChannelType;
  cover: AttachmentSchema[];
  members?: ChannelMemberSchema[];
  last_update_dt?: string;
  last_read_dt?: string;
  // last_message?: MessageSchema;
};

export type ChannelPreviewSchema = Pick<
  ChannelSchema,
  'id' | 'name' | 'type' | 'cover' | 'last_update_dt' | 'last_read_dt'
>;

export type MessageMessageData = {
  local_uuid: string;
  user_id: number;
  text: string;
  updated_at: string;
  created_at: string;
  attachments?: AttachmentSchema[];
};

export type MemberEventWithUserSchema = {
  user_id: undefined | number;
  user: MessageUserSchema;
  created_at: string;
};

export type MemberEventData = {
  user_id: number;
  created_at: string;
};

export type RoomNameChangeData = {
  user_id: undefined | number;
  name: string;
  created_at: string;
};

export type RoomCoverChangeData = {
  user_id: undefined | number;
  cover: AttachmentSchema[];
  created_at: string;
};

export type MessageMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.MESSAGE;
} & MessageMessageData;

export type MemberJoinMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.MEMBER_JOIN;
} & MemberEventWithUserSchema;

export type MemberLeaveMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.MEMBER_LEAVE;
} & MemberEventData;

export type RoomNameChangeMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.ROOM_NAME_CHANGE;
} & RoomNameChangeData;

export type RoomCoverChangeMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.ROOM_COVER_CHANGE;
} & RoomCoverChangeData;

export type MemberOnlineMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.MEMBER_ONLINE;
} & MemberEventData;

export type MemberOfflineMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.MEMBER_OFFLINE;
} & MemberEventData;

export type TypingStartMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.TYPING_START;
} & MemberEventData;

export type TypingStopMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.TYPING_STOP;
} & MemberEventData;

export type MessageUpdateMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.MESSAGE_UPDATE;
} & {
  text: string;
  updated_at: string;
};

export type MessageDeleteMessageEvent = {
  uuid: string;
  room_id: number;
  discriminator: RoomEventDiscriminator.MESSAGE_DELETE;
};

export type MarkReadMessageEvent = {
  room_id: number;
  discriminator: RoomEventDiscriminator.MARK_READ;
  created_at: string;
};

export enum FilteredMessageDiscriminator {
  MESSAGE = 'message',
  MEMBER_JOIN = 'member_join',
  MEMBER_LEAVE = 'member_leave',
  ROOM_NAME_CHANGE = 'room_name_change',
  ROOM_COVER_CHANGE = 'room_cover_change',
}

export type MessageSchema =
  | MessageMessageEvent
  | MemberJoinMessageEvent
  | MemberLeaveMessageEvent
  | RoomNameChangeMessageEvent
  | RoomCoverChangeMessageEvent;

export type RoomMemberEventMessage = MemberJoinMessageEvent | MemberLeaveMessageEvent;

export type RoomEventData =
  | MessageMessageEvent
  | MemberJoinMessageEvent
  | MemberLeaveMessageEvent
  | RoomNameChangeMessageEvent
  | RoomCoverChangeMessageEvent
  | TypingStartMessageEvent
  | TypingStopMessageEvent
  | MessageUpdateMessageEvent
  | MessageDeleteMessageEvent
  | MarkReadMessageEvent;

export interface RoomEvent {
  type: WebSocketEventType.ROOM_EVENT;
  event: RoomEventData;
}

export type UserEventData = {
  discriminator: UserEventDiscriminator;
  room_id: number;
};

export interface UserEvent {
  type: WebSocketEventType.USER_EVENT;
  event: UserEventData;
}

export type RootEvent = RoomEvent | UserEvent;

export type InviteStatus = 'pending' | 'accepted' | 'rejected' | string;

// REST:

export type RestSharedSchema = {
  uuid: string;
  type: string;
  room_id: number;
  author_id: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type RestMessageMessageEvent = RestSharedSchema & {
  type: RoomEventDiscriminator.MESSAGE;
  data: {
    text: string;
    attachments: AttachmentSchema[];
  };
};

export type RestMemberJoinMessageEvent = RestSharedSchema & {
  type: RoomEventDiscriminator.MEMBER_JOIN;
  data: MessageUserSchema;
};

export type RestMemberLeaveMessageEvent = RestSharedSchema & {
  type: RoomEventDiscriminator.MEMBER_LEAVE;
  data: {
    id: number;
  };
};

export type RestRoomNameChangeMessageEvent = RestSharedSchema & {
  type: RoomEventDiscriminator.ROOM_NAME_CHANGE;
  data: RoomNameChangeData;
};

export type RestRoomCoverChangeMessageEvent = RestSharedSchema & {
  type: RoomEventDiscriminator.ROOM_COVER_CHANGE;
  data: RoomCoverChangeData;
};

export type RestMessageSchema =
  | RestMessageMessageEvent
  | RestMemberJoinMessageEvent
  | RestMemberLeaveMessageEvent
  | RestRoomNameChangeMessageEvent
  | RestRoomCoverChangeMessageEvent;
