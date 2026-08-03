import { useEffect, useRef } from 'react';

import { useChatEventService } from 'module/chat/context/chat-event-context';
import { useLastCallback } from 'module/chat/hooks/use-last-callback';
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
  RoomNameChangeMessageEvent,
  RootEvent,
  TypingStartMessageEvent,
  TypingStopMessageEvent,
  UserEvent,
} from 'module/chat/model/types';
import { ChatEventService } from 'module/chat/services/event-service';

export const useCreateChatEvents = () => {
  const eventServiceRef = useRef<ChatEventService | null>(null);

  if (!eventServiceRef.current) {
    eventServiceRef.current = new ChatEventService();
  }

  useEffect(() => {
    return () => {
      if (eventServiceRef.current) {
        eventServiceRef.current.removeAllListeners();
      }
    };
  }, []);

  return eventServiceRef.current;
};

/**
 * Hook for connection status changes
 */
export const useConnectionStatusEvents = (
  callback: (data: { status: 'online' | 'offline'; error?: any }) => void
) => {
  const eventService = useChatEventService();
  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onConnectionChanged(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to all chat events
 */
export const useAllChatEvents = (callback: (event: RootEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onAnyEvent(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to room events
 */
export const useRoomEvents = (callback: (event: RoomEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onRoomEvent(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to user events
 */
export const useUserEvents = (callback: (event: UserEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onUserEvent(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to message events
 */
export const useMessageEvents = (callback: (event: MessageMessageEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onMessage(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to room-specific message events
 */
export const useRoomMessageEvents = (
  roomId: number | null | undefined,
  callback: (event: MessageMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    if (!roomId) return;
    return eventService.onRoomMessage(roomId, lastCallback);
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to member join events
 */
export const useMemberJoinEvents = (callback: (event: MemberJoinMessageEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onMemberJoin(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to room-specific member join events
 */
export const useRoomMemberJoinEvents = (
  roomId: number | null | undefined,
  callback: (event: MemberJoinMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    if (!roomId) return;
    return eventService.onRoomMemberJoin(roomId, lastCallback);
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to member leave events
 */
export const useMemberLeaveEvents = (callback: (event: MemberLeaveMessageEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onMemberLeave(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to room-specific member leave events
 */
export const useRoomMemberLeaveEvents = (
  roomId: number | null | undefined,
  callback: (event: MemberLeaveMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    if (!roomId) return;
    return eventService.onRoomMemberLeave(roomId, lastCallback);
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to room name change events
 */
export const useRoomNameChangeEvents = (callback: (event: RoomNameChangeMessageEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onRoomNameChange(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to room cover change events
 */
export const useRoomCoverChangeEvents = (
  callback: (event: RoomCoverChangeMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onRoomCoverChange(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to room-specific name change events
 */
export const useRoomNameChangeForRoomEvents = (
  roomId: number | null | undefined,
  callback: (event: RoomNameChangeMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    if (!roomId) return;
    return eventService.onRoomNameChangeForRoom(roomId, lastCallback);
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to room-specific cover change events
 */
export const useRoomCoverChangeForRoomEvents = (
  roomId: number | null | undefined,
  callback: (event: RoomCoverChangeMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    if (!roomId) return;
    return eventService.onRoomCoverChangeForRoom(roomId, lastCallback);
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to typing events for a specific room
 */
export const useTypingEvents = (
  roomId: number | null | undefined,
  onTypingStart?: (event: TypingStartMessageEvent) => void,
  onTypingStop?: (event: TypingStopMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastOnTypingStart = useLastCallback(onTypingStart);
  const lastOnTypingStop = useLastCallback(onTypingStop);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribes: Array<() => void> = [];

    if (onTypingStart) {
      unsubscribes.push(eventService.onTypingStartForRoom(roomId, lastOnTypingStart));
    }

    if (onTypingStop) {
      unsubscribes.push(eventService.onTypingStopForRoom(roomId, lastOnTypingStop));
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to mark read events
 */
export const useMarkReadEvents = (callback: (event: MarkReadMessageEvent) => void) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    return eventService.onMarkRead(lastCallback);
  }, [eventService]);
};

/**
 * Hook to subscribe to room-specific mark read events
 */
export const useRoomMarkReadEvents = (
  roomId: number | null | undefined,
  callback: (event: MarkReadMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    if (!roomId) return;
    return eventService.onMarkReadForRoom(roomId, lastCallback);
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to message update, delete and mark read events for a specific room
 */
export const useMessageModificationEvents = (
  roomId: number | null | undefined,
  onUpdate?: (event: MessageUpdateMessageEvent) => void,
  onDelete?: (event: MessageDeleteMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastOnUpdate = useLastCallback(onUpdate);
  const lastOnDelete = useLastCallback(onDelete);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribes: Array<() => void> = [];

    if (onUpdate) {
      unsubscribes.push(eventService.onMessageUpdateForRoom(roomId, lastOnUpdate));
    }

    if (onDelete) {
      unsubscribes.push(eventService.onMessageDeleteForRoom(roomId, lastOnDelete));
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [eventService, roomId]);
};

/**
 * Hook to subscribe to online/offline status events for a specific room
 */
export const useOnlineStatusEvents = (
  roomId: number | null | undefined,
  onOnline?: (event: MemberOnlineMessageEvent) => void,
  onOffline?: (event: MemberOfflineMessageEvent) => void
) => {
  const eventService = useChatEventService();

  const lastOnOnline = useLastCallback(onOnline);
  const lastOnOffline = useLastCallback(onOffline);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribes: Array<() => void> = [];

    if (onOnline) {
      unsubscribes.push(eventService.onRoomMemberOnline(roomId, lastOnOnline));
    }

    if (onOffline) {
      unsubscribes.push(eventService.onRoomMemberOffline(roomId, lastOnOffline));
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [eventService, roomId]);
};
