import {
  MarkReadMessageEvent,
  MemberJoinMessageEvent,
  MemberLeaveMessageEvent,
  MemberOfflineMessageEvent,
  MemberOnlineMessageEvent,
  MessageDeleteMessageEvent,
  MessageMessageEvent,
  MessageUpdateMessageEvent,
  RoomCoverChangeMessageEvent,
  RoomEvent,
  RoomEventDiscriminator,
  RoomNameChangeMessageEvent,
  RootEvent,
  TypingStartMessageEvent,
  TypingStopMessageEvent,
  UserEvent,
  UserEventDiscriminator,
  WebSocketEventType,
} from '../model/types';
import { EventEmitter } from '../utils/event-emitter';

// Define all possible event types
type EventMap = {
  // Root level events
  'event:any': RootEvent;
  'event:room': RoomEvent;
  'event:user': UserEvent;

  // Room discriminator events
  'room:message': MessageMessageEvent;
  'room:member_join': MemberJoinMessageEvent;
  'room:member_leave': MemberLeaveMessageEvent;
  'room:member_online': MemberOnlineMessageEvent;
  'room:member_offline': MemberOfflineMessageEvent;
  'room:name_change': RoomNameChangeMessageEvent;
  'room:cover_change': RoomCoverChangeMessageEvent;
  'room:typing_start': TypingStartMessageEvent;
  'room:typing_stop': TypingStopMessageEvent;
  'room:message_update': MessageUpdateMessageEvent;
  'room:message_delete': MessageDeleteMessageEvent;
  'room:mark_read': MarkReadMessageEvent;

  // Room-specific events
  'room:message:id': { roomId: number; event: MessageMessageEvent };
  'room:member_join:id': { roomId: number; event: MemberJoinMessageEvent };
  'room:member_leave:id': { roomId: number; event: MemberLeaveMessageEvent };
  'room:member_online:id': { roomId: number; event: MemberOnlineMessageEvent };
  'room:member_offline:id': { roomId: number; event: MemberOfflineMessageEvent };
  'room:name_change:id': { roomId: number; event: RoomNameChangeMessageEvent };
  'room:cover_change:id': { roomId: number; event: RoomCoverChangeMessageEvent };
  'room:typing_start:id': { roomId: number; event: TypingStartMessageEvent };
  'room:typing_stop:id': { roomId: number; event: TypingStopMessageEvent };
  'room:message_update:id': { roomId: number; event: MessageUpdateMessageEvent };
  'room:message_delete:id': { roomId: number; event: MessageDeleteMessageEvent };
  'room:mark_read:id': { roomId: number; event: MarkReadMessageEvent };

  // User events
  'user:join': { userId: number; roomId: number };
  'user:leave': { userId: number; roomId: number };

  // Connection status events
  'connection:changed': {
    status: 'online' | 'offline';
    error?: unknown;
  };
};

// For type checking
type EventWithDiscriminator = {
  discriminator: RoomEventDiscriminator;
  room_id: number;
};

export class ChatEventService {
  private emitter = new EventEmitter<EventMap>();

  /**
   * Process and distribute WebSocket message to appropriate subscribers
   */
  processEvent(event: RootEvent): void {
    // Emit the generic event
    this.emitter.emit('event:any', event);

    // Process by event type
    if (event.type === WebSocketEventType.ROOM_EVENT) {
      this.emitter.emit('event:room', event);

      // Get the event data
      const roomEvent = event.event as any;
      const roomId = roomEvent.room_id;
      const discriminator = roomEvent.discriminator;

      // Process each event type based on its discriminator
      this.processRoomEvent(discriminator, roomEvent, roomId);
    } else if (event.type === WebSocketEventType.USER_EVENT) {
      this.emitter.emit('event:user', event);

      const userEvent = event.event;

      switch (userEvent.discriminator) {
        case UserEventDiscriminator.JOIN:
          this.emitter.emit('user:join', { userId: 0, roomId: userEvent.room_id });
          break;

        case UserEventDiscriminator.LEAVE:
          this.emitter.emit('user:leave', { userId: 0, roomId: userEvent.room_id });
          break;
      }
    }
  }

  /**
   * Emits connection status change event
   */
  emitConnectionStatusChange(status: 'online' | 'offline', error?: unknown): void {
    this.emitter.emit('connection:changed', { status, error });
  }

  /**
   * Process room events by discriminator
   */
  private processRoomEvent(
    discriminator: RoomEventDiscriminator,
    event: EventWithDiscriminator,
    roomId: number
  ): void {
    console.log('room event', event);

    if (discriminator === RoomEventDiscriminator.MESSAGE) {
      this.emitter.emit('room:message', event as MessageMessageEvent);
      this.emitter.emit('room:message:id', {
        roomId,
        event: event as MessageMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.MEMBER_JOIN) {
      this.emitter.emit('room:member_join', event as MemberJoinMessageEvent);
      this.emitter.emit('room:member_join:id', {
        roomId,
        event: event as MemberJoinMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.MEMBER_LEAVE) {
      this.emitter.emit('room:member_leave', event as MemberLeaveMessageEvent);
      this.emitter.emit('room:member_leave:id', {
        roomId,
        event: event as MemberLeaveMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.MEMBER_ONLINE) {
      this.emitter.emit('room:member_online', event as MemberOnlineMessageEvent);
      this.emitter.emit('room:member_online:id', {
        roomId,
        event: event as MemberOnlineMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.MEMBER_OFFLINE) {
      this.emitter.emit('room:member_offline', event as MemberOfflineMessageEvent);
      this.emitter.emit('room:member_offline:id', {
        roomId,
        event: event as MemberOfflineMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.ROOM_NAME_CHANGE) {
      this.emitter.emit('room:name_change', event as RoomNameChangeMessageEvent);
      this.emitter.emit('room:name_change:id', {
        roomId,
        event: event as RoomNameChangeMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.ROOM_COVER_CHANGE) {
      this.emitter.emit('room:cover_change', event as RoomCoverChangeMessageEvent);
      this.emitter.emit('room:cover_change:id', {
        roomId,
        event: event as RoomCoverChangeMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.TYPING_START) {
      this.emitter.emit('room:typing_start', event as TypingStartMessageEvent);
      this.emitter.emit('room:typing_start:id', {
        roomId,
        event: event as TypingStartMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.TYPING_STOP) {
      this.emitter.emit('room:typing_stop', event as TypingStopMessageEvent);
      this.emitter.emit('room:typing_stop:id', {
        roomId,
        event: event as TypingStopMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.MESSAGE_UPDATE) {
      this.emitter.emit('room:message_update', event as MessageUpdateMessageEvent);
      this.emitter.emit('room:message_update:id', {
        roomId,
        event: event as MessageUpdateMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.MESSAGE_DELETE) {
      this.emitter.emit('room:message_delete', event as MessageDeleteMessageEvent);
      this.emitter.emit('room:message_delete:id', {
        roomId,
        event: event as MessageDeleteMessageEvent,
      });
    } else if (discriminator === RoomEventDiscriminator.MARK_READ) {
      this.emitter.emit('room:mark_read', event as MarkReadMessageEvent);
      this.emitter.emit('room:mark_read:id', {
        roomId,
        event: event as MarkReadMessageEvent,
      });
    }
  }

  // Subscription methods

  // Subscribe to all events
  onAnyEvent(listener: (event: RootEvent) => void): () => void {
    return this.emitter.on('event:any', listener);
  }

  // Subscribe to room events
  onRoomEvent(listener: (event: RoomEvent) => void): () => void {
    return this.emitter.on('event:room', listener);
  }

  // Subscribe to user events
  onUserEvent(listener: (event: UserEvent) => void): () => void {
    return this.emitter.on('event:user', listener);
  }

  // Subscribe to specific room event types
  onMessage(listener: (event: MessageMessageEvent) => void): () => void {
    return this.emitter.on('room:message', listener);
  }

  onMemberJoin(listener: (event: MemberJoinMessageEvent) => void): () => void {
    return this.emitter.on('room:member_join', listener);
  }

  onMemberLeave(listener: (event: MemberLeaveMessageEvent) => void): () => void {
    return this.emitter.on('room:member_leave', listener);
  }

  onMemberOnline(listener: (event: MemberOnlineMessageEvent) => void): () => void {
    return this.emitter.on('room:member_online', listener);
  }

  onMemberOffline(listener: (event: MemberOfflineMessageEvent) => void): () => void {
    return this.emitter.on('room:member_offline', listener);
  }

  onRoomNameChange(listener: (event: RoomNameChangeMessageEvent) => void): () => void {
    return this.emitter.on('room:name_change', listener);
  }

  onRoomCoverChange(listener: (event: RoomCoverChangeMessageEvent) => void): () => void {
    return this.emitter.on('room:cover_change', listener);
  }

  onTypingStart(listener: (event: TypingStartMessageEvent) => void): () => void {
    return this.emitter.on('room:typing_start', listener);
  }

  onTypingStop(listener: (event: TypingStopMessageEvent) => void): () => void {
    return this.emitter.on('room:typing_stop', listener);
  }

  onMessageUpdate(listener: (event: MessageUpdateMessageEvent) => void): () => void {
    return this.emitter.on('room:message_update', listener);
  }

  onMessageDelete(listener: (event: MessageDeleteMessageEvent) => void): () => void {
    return this.emitter.on('room:message_delete', listener);
  }

  onMarkRead(listener: (event: MarkReadMessageEvent) => void): () => void {
    return this.emitter.on('room:mark_read', listener);
  }

  // Subscribe to room-specific events
  onRoomMessage(roomId: number, listener: (event: MessageMessageEvent) => void): () => void {
    return this.emitter.on('room:message:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onRoomMemberJoin(roomId: number, listener: (event: MemberJoinMessageEvent) => void): () => void {
    return this.emitter.on('room:member_join:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onRoomMemberLeave(
    roomId: number,
    listener: (event: MemberLeaveMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:member_leave:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onRoomMemberOnline(
    roomId: number,
    listener: (event: MemberOnlineMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:member_online:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onRoomMemberOffline(
    roomId: number,
    listener: (event: MemberOfflineMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:member_offline:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onRoomNameChangeForRoom(
    roomId: number,
    listener: (event: RoomNameChangeMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:name_change:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onRoomCoverChangeForRoom(
    roomId: number,
    listener: (event: RoomCoverChangeMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:cover_change:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onTypingStartForRoom(
    roomId: number,
    listener: (event: TypingStartMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:typing_start:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onTypingStopForRoom(
    roomId: number,
    listener: (event: TypingStopMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:typing_stop:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onMessageUpdateForRoom(
    roomId: number,
    listener: (event: MessageUpdateMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:message_update:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onMessageDeleteForRoom(
    roomId: number,
    listener: (event: MessageDeleteMessageEvent) => void
  ): () => void {
    return this.emitter.on('room:message_delete:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  onMarkReadForRoom(roomId: number, listener: (event: MarkReadMessageEvent) => void): () => void {
    return this.emitter.on('room:mark_read:id', (data) => {
      if (data.roomId === roomId) {
        listener(data.event);
      }
    });
  }

  // Subscribe to user events
  onUserJoin(listener: (data: { userId: number; roomId: number }) => void): () => void {
    return this.emitter.on('user:join', listener);
  }

  onUserLeave(listener: (data: { userId: number; roomId: number }) => void): () => void {
    return this.emitter.on('user:leave', listener);
  }

  // Subscribe to connection status changes
  onConnectionChanged(
    callback: (data: { status: 'online' | 'offline'; error?: unknown }) => void
  ): () => void {
    return this.emitter.on('connection:changed', callback);
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}

// Export type for consumers
export type { EventMap as ChatEventMap };
