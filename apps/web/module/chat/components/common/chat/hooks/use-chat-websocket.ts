import { useEffect, useMemo, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { ChatContextValue } from 'module/chat/context';
import { useLastCallback } from 'module/chat/hooks/use-last-callback';
import { useStateRef } from 'module/chat/hooks/use-state-ref';
import { ChatEndpoints } from 'module/chat/model/toolkit/endpoints';
import { CreateMessageRequestSchema } from 'module/chat/model/toolkit/types';
import { RoomEventDiscriminator, RootEvent, WebSocketEventType } from 'module/chat/model/types';

import { useLogged } from '~shared/lib/session/use-logged';
import { CookieService } from '~shared/utils/cookie-service';

import { serializeWsEvent } from '../../../../model/toolkit/serializers';

type UseChatWebSocketProps = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onProcessMessage?: (data: RootEvent) => void;
  onConnectionStatusChange?: (status: 'online' | 'offline', error?: any) => void;
};

const PING_INTERVAL = 15000;

export const useChatWebSocket = (props: UseChatWebSocketProps): ChatContextValue['client'] => {
  const { onOpen, onClose, onError, onMessage, onProcessMessage, onConnectionStatusChange } = props;
  const logged = useLogged();
  const [shouldReconnect, setShouldReconnect] = useState(true);
  const reconnectAttempts = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const ws = useWebSocket(
    ChatEndpoints.ws,
    {
      queryParams: {
        token: logged ? CookieService.get('token')! : '',
      },
      shouldReconnect: () => shouldReconnect,
      reconnectAttempts: Infinity,
      reconnectInterval: 3000,
      retryOnError: true,
      onOpen: () => {
        reconnectAttempts.current = 0;
        onConnectionStatusChange?.('online');
        onOpen?.();

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          ws.sendMessage(JSON.stringify({ type: 'ping' }));
        }, PING_INTERVAL);
      },
      onClose: () => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        if (ws.readyState !== ReadyState.CLOSING) {
          onConnectionStatusChange?.('offline');
          onClose?.();
        }
      },
      onError: (error) => {
        onConnectionStatusChange?.('offline', error);
        onError?.(error);
      },
      onMessage: (event) => {
        onMessage?.(event);
        try {
          const data = JSON.parse(event.data) as RootEvent;
          onProcessMessage?.(serializeWsEvent(data));
        } catch (error) {
          onError?.(error as Event);
        }
      },
    },
    logged
  );

  const readyStateRef = useStateRef(ws.readyState);

  useEffect(() => {
    if (ws.readyState !== ReadyState.CLOSED) return;

    reconnectAttempts.current += 1;
    const backoff = Math.min(30000, 1000 * 2 ** reconnectAttempts.current);
    setShouldReconnect(false);

    reconnectTimeoutRef.current = setTimeout(() => {
      setShouldReconnect(true);
      ws.getWebSocket()?.close();
    }, backoff);

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [ws.readyState]);

  const sendMessage = useLastCallback((message: CreateMessageRequestSchema) => {
    if (readyStateRef.current === WebSocket.OPEN) {
      ws.sendMessage(JSON.stringify(message));
    }
  });

  const markRead = useLastCallback((channelId: number) => {
    if (readyStateRef.current === WebSocket.OPEN) {
      ws.sendMessage(JSON.stringify({ type: 'read', room_id: channelId }));
      onProcessMessage?.({
        type: WebSocketEventType.ROOM_EVENT,
        event: {
          discriminator: RoomEventDiscriminator.MARK_READ,
          room_id: channelId,
          created_at: new Date().toISOString(),
        },
      });
    }
  });

  const startTyping = useLastCallback((channelId: number) => {
    if (readyStateRef.current === WebSocket.OPEN) {
      ws.sendMessage(JSON.stringify({ type: 'typing_start', room_id: channelId }));
    }
  });

  const stopTyping = useLastCallback((channelId: number) => {
    if (readyStateRef.current === WebSocket.OPEN) {
      ws.sendMessage(JSON.stringify({ type: 'typing_end', room_id: channelId }));
    }
  });

  return useMemo(
    () => ({
      sendMessage,
      readyStateRef,
      startTyping,
      stopTyping,
      markRead,
    }),
    []
  );
};
