import { useEffect, useRef } from 'react';

import type { ChatMessage } from '../../../../context';

export function useShouldForceScrollToBottom(messages: ChatMessage[], currentUserId?: number) {
  const lastFocusedOwnMessage = useRef<string>(undefined);
  const initialFocusRegistered = useRef(false);

  function recheckForNewOwnMessage() {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]!;

      if (
        lastMessage.user_id === currentUserId &&
        lastFocusedOwnMessage.current !== lastMessage.uuid
      ) {
        lastFocusedOwnMessage.current = lastMessage.uuid;
        return true;
      }
    }
    return false;
  }

  useEffect(() => {
    if (messages && messages.length && !initialFocusRegistered.current) {
      initialFocusRegistered.current = true;
      recheckForNewOwnMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, messages?.length]);

  return recheckForNewOwnMessage;
}
