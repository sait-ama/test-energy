import { ChatMessage } from '../../../context';

// Определяем тип для расширенного сообщения
type ExtendedChatMessage = ChatMessage & {
  local_uuid?: string;
};

// Группируем действия по логическим блокам
type FetchMessagesActions =
  | { type: 'FETCH_MESSAGES_START' }
  | {
      type: 'FETCH_MESSAGES_SUCCESS';
      payload: {
        messages: ExtendedChatMessage[];
        hasMore: boolean;
        hasMoreNewer: boolean;
        next?: string;
        previous?: string;
      };
    }
  | { type: 'FETCH_MESSAGES_ERROR'; payload: { error: Error } };

type FetchMoreActions =
  | { type: 'FETCH_MORE_START' }
  | {
      type: 'FETCH_MORE_SUCCESS';
      payload: { messages: ExtendedChatMessage[]; hasMore: boolean; next?: string };
    }
  | { type: 'FETCH_MORE_ERROR'; payload: { error: Error } };

type FetchMoreNewerActions =
  | { type: 'FETCH_MORE_NEWER_START' }
  | {
      type: 'FETCH_MORE_NEWER_SUCCESS';
      payload: { messages: ExtendedChatMessage[]; hasMoreNewer: boolean; previous?: string };
    }
  | { type: 'FETCH_MORE_NEWER_ERROR'; payload: { error: Error } };

type MessageManipulationActions =
  | { type: 'ADD_MESSAGE'; payload: { message: ExtendedChatMessage } }
  | {
      type: 'UPDATE_MESSAGE';
      payload:
        | {
            message: ExtendedChatMessage;
            messageLocalUuid?: string;
            messageUuid?: string;
            merge?: boolean;
          }
        | {
            message: Partial<ExtendedChatMessage>;
            messageLocalUuid?: string;
            messageUuid?: string;
            merge: true;
          };
    }
  | { type: 'BATCH_UPDATE_MESSAGES'; payload: { messages: ExtendedChatMessage[] } }
  | { type: 'REMOVE_MESSAGE'; payload: { messageUuid: string } };

type HighlightActions =
  | { type: 'SET_HIGHLIGHTED_MESSAGE'; payload: { messageUuid: string } }
  | { type: 'CLEAR_HIGHLIGHTED_MESSAGE' };

type NavigationActions = {
  type: 'JUMP_TO_MESSAGE_SUCCESS';
  payload: {
    messages: ExtendedChatMessage[];
    hasMore: boolean;
    hasMoreNewer: boolean;
    next?: string;
    previous?: string;
  };
};

// Добавляем действия для управления статусом печати
type TypingActions =
  | { type: 'SET_USER_TYPING'; payload: { userId: number } }
  | { type: 'UNSET_USER_TYPING'; payload: { userId: number } }
  | { type: 'CLEAR_ALL_TYPING' };

// Объединяем все типы действий
export type ChannelStateReducerAction =
  | FetchMessagesActions
  | FetchMoreActions
  | FetchMoreNewerActions
  | MessageManipulationActions
  | HighlightActions
  | NavigationActions
  | TypingActions;

// Расширяем состояние канала для поддержки ExtendedChatMessage
export interface ExtendedChannelState {
  suppressAutoscroll: boolean;
  messages: ExtendedChatMessage[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  typing: Record<number, boolean>;
  loadingMore: boolean;
  hasMoreNewer: boolean;
  loadingMoreNewer: boolean;
  next?: string;
  previous?: string;
  highlightedMessageUuid?: string;
}

// Initial state
export const initialState: ExtendedChannelState = {
  suppressAutoscroll: false,
  messages: [],
  loading: false,
  error: null,
  typing: {},
  hasMore: false,
  loadingMore: false,
  hasMoreNewer: false,
  loadingMoreNewer: false,
  next: undefined,
  previous: undefined,
  highlightedMessageUuid: undefined,
};

// Вспомогательные функции для reducer
const handleFetchMessages = (
  state: ExtendedChannelState,
  action: FetchMessagesActions
): ExtendedChannelState => {
  switch (action.type) {
    case 'FETCH_MESSAGES_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_MESSAGES_SUCCESS':
      return {
        ...state,
        loading: false,
        messages: [...action.payload.messages].reverse(),
        hasMore: action.payload.hasMore,
        hasMoreNewer: action.payload.hasMoreNewer,
        next: action.payload.next,
        previous: action.payload.previous,
      };
    case 'FETCH_MESSAGES_ERROR':
      return { ...state, loading: false, error: action.payload.error };
    default:
      return state;
  }
};

const handleFetchMore = (
  state: ExtendedChannelState,
  action: FetchMoreActions
): ExtendedChannelState => {
  switch (action.type) {
    case 'FETCH_MORE_START':
      return { ...state, loadingMore: true };
    case 'FETCH_MORE_SUCCESS':
      return {
        ...state,
        loadingMore: false,
        messages: [...(action.payload.messages || []).reverse(), ...(state.messages || [])],
        hasMore: action.payload.hasMore,
        next: action.payload.next,
      };
    case 'FETCH_MORE_ERROR':
      return { ...state, loadingMore: false, error: action.payload.error };
    default:
      return state;
  }
};

const handleFetchMoreNewer = (
  state: ExtendedChannelState,
  action: FetchMoreNewerActions
): ExtendedChannelState => {
  switch (action.type) {
    case 'FETCH_MORE_NEWER_START':
      return { ...state, loadingMoreNewer: true };
    case 'FETCH_MORE_NEWER_SUCCESS':
      return {
        ...state,
        loadingMoreNewer: false,
        messages: [...(state.messages || []), ...(action.payload.messages || [])],
        hasMoreNewer: action.payload.hasMoreNewer,
        previous: action.payload.previous,
      };
    case 'FETCH_MORE_NEWER_ERROR':
      return { ...state, loadingMoreNewer: false, error: action.payload.error };
    default:
      return state;
  }
};

/**
 * Обрабатывает добавление нового сообщения в состояние
 */
const handleAddMessage = (
  state: ExtendedChannelState,
  message: ExtendedChatMessage
): ExtendedChannelState => {
  // Check for duplicate messages before adding
  const messageExistsIndex = state.messages.findIndex((msg) => {
    if (message.local_uuid) {
      return !!msg.local_uuid && msg.local_uuid === message.local_uuid;
    }
    return msg.uuid === message.uuid;
  });

  if (messageExistsIndex !== -1) {
    // If the message already exists, update it instead
    return {
      ...state,
      messages: state.messages.map((msg, index) => (index === messageExistsIndex ? message : msg)),
    };
  }

  // Add the new message to the end of the array
  return {
    ...state,
    messages: [...state.messages, message],
  };
};

/**
 * Обрабатывает обновление сообщения в состоянии
 */
const handleUpdateMessage = (
  state: ExtendedChannelState,
  message: ExtendedChatMessage | Partial<ExtendedChatMessage>,
  messageLocalUuid?: string,
  messageUuid?: string,
  merge = false
): ExtendedChannelState => {
  const effectiveMessageUuid = messageUuid ?? message.uuid;

  // Check if the message exists in the array before mapping
  const messageIndex = state.messages.findIndex((msg) => {
    if (messageLocalUuid) {
      if (!msg.local_uuid) return false;
      return msg.local_uuid === messageLocalUuid;
    }
    return msg.uuid === effectiveMessageUuid;
  });

  if (messageIndex === -1) {
    // Message not found, return state unchanged
    return state;
  }

  // Create a new messages array with the updated message
  const updatedMessages = [...state.messages];
  // @ts-ignore
  updatedMessages[messageIndex] = merge
    ? { ...updatedMessages[messageIndex], ...message }
    : message;

  return {
    ...state,
    messages: updatedMessages,
  };
};

/**
 * Обрабатывает пакетное обновление сообщений
 */
const handleBatchUpdateMessages = (
  state: ExtendedChannelState,
  messages: ExtendedChatMessage[]
): ExtendedChannelState => {
  // If no messages to update, return state unchanged
  if (!messages.length) {
    return state;
  }

  // Create a map of message UUIDs to updated messages for faster lookup
  const messageMap = new Map(messages.map((message) => [message.uuid, message]));

  // Update all messages in a single pass
  const batchUpdatedMessages = state.messages.map((message) =>
    messageMap.has(message.uuid) ? messageMap.get(message.uuid)! : message
  );

  return {
    ...state,
    messages: batchUpdatedMessages,
  };
};

/**
 * Обрабатывает удаление сообщения из состояния
 */
const handleRemoveMessage = (
  state: ExtendedChannelState,
  messageUuid: string
): ExtendedChannelState => {
  // Use filter once with a direct comparison for better performance
  const filteredMessages = state.messages.filter((msg) => msg.uuid !== messageUuid);

  // If no messages were removed, return state unchanged
  if (filteredMessages.length === state.messages.length) {
    return state;
  }

  return {
    ...state,
    messages: filteredMessages,
  };
};

/**
 * Обработчики для статуса печати
 */
const handleTypingActions = (
  state: ExtendedChannelState,
  action: TypingActions
): ExtendedChannelState => {
  switch (action.type) {
    case 'SET_USER_TYPING':
      return {
        ...state,
        typing: { ...state.typing, [action.payload.userId]: true },
      };
    case 'UNSET_USER_TYPING':
      const newTyping = { ...state.typing };
      delete newTyping[action.payload.userId];
      return {
        ...state,
        typing: newTyping,
      };
    case 'CLEAR_ALL_TYPING':
      return {
        ...state,
        typing: {},
      };
    default:
      return state;
  }
};

// Основной reducer
export const channelReducer = (
  state: ExtendedChannelState,
  action: ChannelStateReducerAction
): ExtendedChannelState => {
  // Обрабатываем действия по группам
  if (action.type.startsWith('FETCH_MESSAGES_')) {
    return handleFetchMessages(state, action as FetchMessagesActions);
  }

  if (action.type.startsWith('FETCH_MORE_NEWER_')) {
    return handleFetchMoreNewer(state, action as FetchMoreNewerActions);
  }

  if (action.type.startsWith('FETCH_MORE_')) {
    return handleFetchMore(state, action as FetchMoreActions);
  }

  // Обрабатываем действия для typing состояний
  if (
    action.type === 'SET_USER_TYPING' ||
    action.type === 'UNSET_USER_TYPING' ||
    action.type === 'CLEAR_ALL_TYPING'
  ) {
    return handleTypingActions(state, action as TypingActions);
  }

  // Обрабатываем остальные действия
  switch (action.type) {
    case 'ADD_MESSAGE':
      return handleAddMessage(state, action.payload.message);

    case 'UPDATE_MESSAGE':
      return handleUpdateMessage(
        state,
        action.payload.message,
        action.payload.messageLocalUuid,
        action.payload.messageUuid,
        'merge' in action.payload ? action.payload.merge : false
      );

    case 'BATCH_UPDATE_MESSAGES':
      return handleBatchUpdateMessages(state, action.payload.messages);

    case 'REMOVE_MESSAGE':
      return handleRemoveMessage(state, action.payload.messageUuid);

    case 'SET_HIGHLIGHTED_MESSAGE':
      return {
        ...state,
        highlightedMessageUuid: action.payload.messageUuid,
      };

    case 'CLEAR_HIGHLIGHTED_MESSAGE':
      return {
        ...state,
        highlightedMessageUuid: undefined,
      };

    case 'JUMP_TO_MESSAGE_SUCCESS':
      return {
        ...state,
        messages: [...action.payload.messages].reverse(),
        hasMore: action.payload.hasMore,
        hasMoreNewer: action.payload.hasMoreNewer,
        next: action.payload.next,
        previous: action.payload.previous,
      };

    default:
      return state;
  }
};
