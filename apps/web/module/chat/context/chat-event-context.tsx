import { createContext } from '@re/core/utils/create-context';

import { ChatEventService } from '../services/event-service';

export type ChatEventContextValue = ChatEventService;

export const {
  useStore: useChatEventContext,
  Provider: ChatEventProvider,
  Context: ChatEventContext,
} = createContext<ChatEventContextValue, ChatEventContextValue>((v) => v, 'ChatEventContext');

export const useChatEventService = (): ChatEventService => {
  const context = useChatEventContext();

  return context;
};
