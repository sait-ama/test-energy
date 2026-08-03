import {
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { ChannelMembersProvider } from 'module/chat/context/channel-members-context';
import { TypingProvider } from 'module/chat/context/typing-context';
import {
  getChannelByIdQueryKey,
  useChannelByIdSuspenseQuery,
} from 'module/chat/model/toolkit/queries';
import { WebSocketRequestSchema } from 'module/chat/model/toolkit/types';
import { generateTimeBasedUuid } from 'module/chat/utils/uuid';
import { toast } from 'sonner';

import { cn } from '@re/ui-kit/utils/cn';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

import { DEFAULT_NEXT_CHANNEL_PAGE_SIZE } from '../../../constants/limits';
import {
  ChannelActionContextValue,
  ChannelActionProvider,
  MarkReadWrapperOptions,
  MessageToSend,
} from '../../../context/channel-actions-context';
import { ChannelMemberPreviewProvider } from '../../../context/channel-member-preview-context';
import {
  ChannelCapability,
  ChannelStateProvider,
  ChatMessage,
  ChatMessageMessage,
  MessageStatus,
} from '../../../context/channel-state-context';
import { useChatContext } from '../../../context/chat-context';
import { useSuspenseState } from '../../../hooks/use-suspense-state';
import { ChatRepository } from '../../../model/toolkit/repository';
import {
  ChannelSchema,
  ChannelType,
  RoleChatUser,
  RoomEventDiscriminator,
} from '../../../model/types';
import { SendMessageOptions, UpdateMessageOptions } from '../../../types';
import {
  useConnectionStatusEvents,
  useMessageModificationEvents,
  useRoomCoverChangeForRoomEvents,
  useRoomMessageEvents,
  useRoomNameChangeForRoomEvents,
} from '../chat/hooks';
import { LoadingIndicator as DefaultLoadingIndicator } from '../loading/loading-indicator';
import { DropzoneProvider } from '../message-input/dropzone-provider';
import { useCreateChannelMembersContext } from './hooks/use-create-channel-members-context';
import { useCreateChannelStateContext } from './hooks/use-create-channel-state-context';
import { useCreateTypingContext } from './hooks/use-create-typing-context';
import { ChannelEmptyPlaceholder as DefaultChannelEmptyPlaceholder } from './channel-empty-placeholder';
import { ChannelErrorState } from './channel-loading-error';
import { channelReducer, ChannelStateReducerAction, initialState } from './channel-state';

export type ChannelProps = {
  dragAndDropWindow?: boolean;
};

const DefaultChannelContainer = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center', className)}>
      {children}
    </div>
  );
};

const ChannelInner = (props: PropsWithChildren<ChannelProps & { channelId: number }>) => {
  const { children, channelId, dragAndDropWindow = true } = props;

  const { user, client } = useChatContext('Channel');
  const online = useRef(true);

  const queryClient = useQueryClient();

  const { data: channel } = useChannelByIdSuspenseQuery({
    variables: {
      params: {
        channelId: channelId,
      },
    },
  });

  const isEnabled = !!channelId;

  const [state, dispatch] = useReducer(channelReducer, initialState);

  const {
    messages: rawMessages,
    loading,
    error,
    hasMore,
    loadingMore,
    hasMoreNewer,
    loadingMoreNewer,
  } = state;

  // Fetch messages effect
  useEffect(() => {
    if (!isEnabled) return;

    const fetchMessages = async () => {
      dispatch({ type: 'FETCH_MESSAGES_START' });

      const limit = DEFAULT_NEXT_CHANNEL_PAGE_SIZE;
      try {
        // The response is now already serialized by the repository
        const response = await ChatRepository.Messages.messages({
          params: {
            channelId,
          },
          query: {
            limit,
          },
        });

        dispatch({
          type: 'FETCH_MESSAGES_SUCCESS',
          payload: {
            messages: response.results,
            hasMore: response.results.length === limit,
            hasMoreNewer: false,
            next: response.next || undefined,
            previous: response.previous || undefined,
          },
        });
      } catch (err: any) {
        dispatch({ type: 'FETCH_MESSAGES_ERROR', payload: { error: err } });
      }
    };

    fetchMessages();
  }, [channelId, isEnabled]);

  const loadMore = useCallback(async () => {
    if (!online.current || !isEnabled || !state.hasMore || loadingMore) return;

    dispatch({ type: 'FETCH_MORE_START' });

    const limit = DEFAULT_NEXT_CHANNEL_PAGE_SIZE;
    try {
      const response = await ChatRepository.Messages.messages({
        params: {
          channelId,
        },
        query: {
          limit,
          created_at__lt: new Date(state.messages[0]!.created_at).toISOString(),
        },
      });

      dispatch({
        type: 'FETCH_MORE_SUCCESS',
        payload: {
          messages: response.results,
          hasMore: response.results.length === limit,
          next: response.next || undefined,
        },
      });
    } catch (err: any) {
      dispatch({ type: 'FETCH_MORE_ERROR', payload: { error: err } });
    }
  }, [state.hasMore, loadingMore, isEnabled, channelId]);

  // Loads newer messages
  const loadMoreNewer = useCallback(async () => {
    if (!online.current || !isEnabled || !state.hasMoreNewer || loadingMoreNewer) return;

    dispatch({ type: 'FETCH_MORE_NEWER_START' });

    try {
      const limit = DEFAULT_NEXT_CHANNEL_PAGE_SIZE;

      const response = await ChatRepository.Messages.messages({
        params: {
          channelId,
        },
        query: {
          limit,
          created_at__gt: new Date(
            state.messages[state.messages.length - 1]!.created_at
          ).toISOString(),
        },
      });

      dispatch({
        type: 'FETCH_MORE_NEWER_SUCCESS',
        payload: {
          messages: response.results,
          hasMoreNewer: response.results.length === limit,
          previous: response.previous || undefined,
        },
      });
    } catch (err: any) {
      dispatch({ type: 'FETCH_MORE_NEWER_ERROR', payload: { error: err } });
    }
  }, [state.hasMoreNewer, loadingMoreNewer, isEnabled, channelId]);

  const removeMessage = useCallback(
    (message: ChatMessageMessage) => {
      dispatch({
        type: 'REMOVE_MESSAGE',
        payload: { messageUuid: message.uuid },
      });
    },
    [dispatch]
  );

  const updateMessage = useCallback(
    (message: ChatMessageMessage) => {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { message: message as ChatMessage },
      });
    },
    [dispatch]
  );

  const addNotification = useCallback(
    (text: string, type: 'error' | 'info' | 'success' | 'warning') => {
      toast(text);
    },
    []
  );

  const handleDispatch = useCallback((action: ChannelStateReducerAction) => {
    dispatch(action);
  }, []);

  // Add your sendMessage function to handle sending messages through websocket
  const sendMessage = useCallback(
    async (
      messageData: MessageToSend,
      customMessageData?: Partial<ChatMessageMessage>,
      options: SendMessageOptions = {}
    ) => {
      if (!isEnabled) return;

      const tempUuid = generateTimeBasedUuid();

      const optimisticMessage: ChatMessageMessage = {
        uuid: tempUuid,
        discriminator: RoomEventDiscriminator.MESSAGE,
        room_id: channelId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: MessageStatus.SENDING,
        ...customMessageData,
        user_id: user.id,
        local_uuid: tempUuid,
        text: messageData.text || '',
      };

      // Add optimistic message to the state
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { message: optimisticMessage },
      });

      const messageToSend: WebSocketRequestSchema = {
        room_id: channelId,
        text: optimisticMessage.text,
        local_uuid: optimisticMessage.local_uuid,
        type: RoomEventDiscriminator.MESSAGE,
      };

      client.sendMessage(messageToSend);
    },
    [isEnabled, user, channelId]
  );

  // Handle message deletion
  const deleteMessage = useCallback(
    async (messageUuid: string) => {
      if (!isEnabled) return;

      try {
        const messageToDelete = rawMessages.find((msg) => msg.uuid === messageUuid);
        if (!messageToDelete) {
          throw new Error('Message not found');
        }

        const deletedMessage = {
          ...messageToDelete,
          is_deleted: true,
        };

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: { message: deletedMessage, messageUuid },
        });

        // Call the API to delete the message
        await ChatRepository.Messages.MessageById.remove?.({
          params: {
            messageUuid,
          },
        });
      } catch {
        addNotification('Failed to delete message', 'error');
        const messageToRestore = rawMessages.find((msg) => msg.uuid === messageUuid);
        if (messageToRestore) {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { message: messageToRestore, messageUuid },
          });
        }
      }
    },
    [isEnabled, rawMessages, addNotification]
  );

  const editMessage = useCallback(
    async (message: ChatMessageMessage, options?: UpdateMessageOptions) => {
      try {
        // Update the message locally first with a pending status
        updateMessage({
          ...message,
          status: MessageStatus.SENDING,
        });

        await ChatRepository.Messages.MessageById.change({
          params: {
            messageUuid: message.uuid,
          },
          data: {
            text: message.text || '',
          },
        });

        // Update the message with the response
        updateMessage({
          ...message,
          status: MessageStatus.SENT,
        });
      } catch (error) {
        updateMessage({
          ...message,
          status: MessageStatus.FAILED,
        });

        addNotification('Failed to edit message', 'error');
        throw error;
      }
    },
    [channelId, updateMessage, addNotification]
  );

  const jumpToMessage = useCallback(
    async (messageUuid: string, limit?: number, highlightDuration?: number) => {
      dispatch({
        type: 'SET_HIGHLIGHTED_MESSAGE',
        payload: { messageUuid },
      });

      // Implementation would go here to fetch messages around the target message
      try {
        const response = await ChatRepository.Messages.messages({
          params: {
            channelId,
          },
          query: {
            limit: limit || DEFAULT_NEXT_CHANNEL_PAGE_SIZE,
            cursor: messageUuid,
          },
        });

        dispatch({
          type: 'JUMP_TO_MESSAGE_SUCCESS',
          payload: {
            messages: response.results,
            hasMore: !!response.next,
            hasMoreNewer: !!response.previous,
            next: response.next || undefined,
            previous: response.previous || undefined,
          },
        });

        // Clear the highlight after the specified duration
        if (highlightDuration) {
          setTimeout(() => {
            dispatch({ type: 'CLEAR_HIGHLIGHTED_MESSAGE' });
          }, highlightDuration);
        }
      } catch {
        addNotification('Failed to jump to message', 'error');
      }
    },
    [channelId, addNotification]
  );

  const jumpToLatestMessage = useCallback(async () => {
    try {
      const response = await ChatRepository.Messages.messages({
        params: {
          channelId,
        },
        query: {
          limit: DEFAULT_NEXT_CHANNEL_PAGE_SIZE,
        },
      });

      dispatch({
        type: 'FETCH_MESSAGES_SUCCESS',
        payload: {
          messages: response.results,
          hasMore: !!response.next,
          hasMoreNewer: !!response.previous,
          next: response.next || undefined,
          previous: response.previous || undefined,
        },
      });
    } catch {
      addNotification('Failed to load latest messages', 'error');
    }
  }, [channelId, addNotification]);

  const jumpToFirstUnreadMessage = useCallback(
    async (queryMessageLimit?: number, highlightDuration?: number) => {
      try {
        // Implementation would go here to fetch the first unread message
        // For now, we'll just jump to the latest message
        await jumpToLatestMessage();
      } catch {
        addNotification('Failed to jump to first unread message', 'error');
      }
    },
    [jumpToLatestMessage, addNotification]
  );

  // Mark all messages as read
  const markRead = useCallback(
    async (options?: MarkReadWrapperOptions) => {
      if (!isEnabled || !channelId) return;
      client.markRead(channelId);
    },
    [isEnabled, channelId]
  );

  const retrySendMessage = useCallback(
    async (message: ChatMessageMessage) => {
      if (message.status !== MessageStatus.FAILED) {
        return;
      }

      // remove old message
      removeMessage(message);

      sendMessage({
        text: message.text,
        attachments: message.attachments,
      });
    },
    [channelId, updateMessage, addNotification]
  );

  const batchUpdateMessages = useCallback((updatedMessages: ChatMessageMessage[]) => {
    if (!updatedMessages.length) return;

    // Use a single dispatch to update multiple messages
    dispatch({
      type: 'BATCH_UPDATE_MESSAGES',
      payload: { messages: updatedMessages as ChatMessage[] },
    });
  }, []);

  const startTyping = useCallback(() => {
    if (online.current) {
      client.startTyping(channelId);
    }
  }, [channelId]);

  const stopTyping = useCallback(() => {
    if (online.current) {
      client.stopTyping(channelId);
    }
  }, [channelId]);

  useRoomMessageEvents(channel.id, (message) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { message },
    });
  });

  useRoomNameChangeForRoomEvents(channel.id, (event) => {
    queryClient.setQueryData(
      getChannelByIdQueryKey({ params: { channelId } }),
      (old: ChannelSchema) => {
        return {
          ...old,
          name: event.name,
        };
      }
    );
  });

  useRoomCoverChangeForRoomEvents(channel.id, (event) => {
    queryClient.setQueryData(
      getChannelByIdQueryKey({ params: { channelId } }),
      (old: ChannelSchema) => {
        return {
          ...old,
          cover: event.cover,
        };
      }
    );
  });

  useMessageModificationEvents(
    channel.id,
    (message) => {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          message: { ...message, discriminator: RoomEventDiscriminator.MESSAGE },
          merge: true,
        },
      });
    },
    (message) => {
      dispatch({
        type: 'REMOVE_MESSAGE',
        payload: { messageUuid: message.uuid },
      });
    }
  );

  useConnectionStatusEvents((event) => {
    online.current = event.status === 'online';
  });

  const messages = useMemo(() => {
    if (!rawMessages.length) return [];

    const filteredTypes = new Set([RoomEventDiscriminator.MESSAGE]);

    if (channel.type === ChannelType.GROUP) {
      filteredTypes.add(RoomEventDiscriminator.MEMBER_JOIN);
      filteredTypes.add(RoomEventDiscriminator.MEMBER_LEAVE);
    }

    return rawMessages.filter((v) => filteredTypes.has(v.discriminator));
  }, [rawMessages]);

  const meInChannel = useMemo(() => {
    return channel.members?.find((member) => member.id === user.id);
  }, [channel.members, user.id]);

  const channelCapabilities = useMemo(() => {
    return {
      [ChannelCapability.MANAGE_MEMBERS]: meInChannel?.role === RoleChatUser.CREATOR,
      [ChannelCapability.MANAGE_CHANNEL]: meInChannel?.role === RoleChatUser.CREATOR,
      [ChannelCapability.LEAVE_CHANNEL]: meInChannel?.role !== RoleChatUser.CREATOR,
    };
  }, [meInChannel]);

  const contextState = {
    loading,
    error,
    hasMore,
    loadingMore,
    hasMoreNewer,
    loadingMoreNewer,
    suppressAutoscroll: false,
  };

  const channelStateContextValue = useCreateChannelStateContext({
    ...contextState,
    dragAndDropWindow,
    channel,
    messages,
    multipleUploads: true,
    maxNumberOfFiles: 3,
    channelCapabilities,
  });

  const channelActionContextValue: ChannelActionContextValue = useMemo(
    () => ({
      addNotification,
      deleteMessage,
      dispatch: handleDispatch,
      editMessage,
      jumpToLatestMessage,
      jumpToMessage,
      jumpToFirstUnreadMessage,
      loadMore,
      loadMoreNewer,
      markRead,
      removeMessage,
      retrySendMessage,
      sendMessage,
      skipMessageDataMemoization: false,
      updateMessage,
      batchUpdateMessages,
      startTyping,
      stopTyping,
    }),
    [
      deleteMessage,
      loadMore,
      loadMoreNewer,
      markRead,
      jumpToMessage,
      jumpToLatestMessage,
      jumpToFirstUnreadMessage,
      sendMessage,
      retrySendMessage,
      editMessage,
      removeMessage,
      updateMessage,
      addNotification,
      handleDispatch,
      batchUpdateMessages,
      startTyping,
      stopTyping,
    ]
  );

  const channelMembersContextValue = useCreateChannelMembersContext({
    members: channel.members || [],
  });

  const typingContextValue = useCreateTypingContext({
    typing: [],
  });

  useSuspenseState(loading, error);

  return (
    <ChannelMembersProvider value={channelMembersContextValue}>
      <ChannelStateProvider value={channelStateContextValue}>
        <ChannelActionProvider value={channelActionContextValue}>
          <ChannelMemberPreviewProvider>
            <TypingProvider value={typingContextValue}>
              {dragAndDropWindow ? <DropzoneProvider>{children}</DropzoneProvider> : children}
            </TypingProvider>
          </ChannelMemberPreviewProvider>
        </ChannelActionProvider>
      </ChannelStateProvider>
    </ChannelMembersProvider>
  );
};

const ChannelUnMemoized = (
  props: PropsWithChildren<
    ChannelProps & {
      EmptyPlaceholder?: React.ComponentType;
      LoadingErrorIndicator?: React.ComponentType;
      ChannelContainer?: React.ComponentType;
      LoadingIndicator?: React.ComponentType;
    }
  >
) => {
  const {
    EmptyPlaceholder = DefaultChannelEmptyPlaceholder,
    LoadingErrorIndicator = ChannelErrorState,
    ChannelContainer = DefaultChannelContainer,
    LoadingIndicator = DefaultLoadingIndicator,
  } = props;

  const { activeChannelId } = useChatContext();

  if (!activeChannelId)
    return (
      <ChannelContainer>
        <EmptyPlaceholder />
      </ChannelContainer>
    );

  return (
    <QuerySuspenseContainer
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ChannelContainer>
          {LoadingErrorIndicator ? <LoadingErrorIndicator refetch={resetErrorBoundary} /> : null}
        </ChannelContainer>
      )}
      fallback={
        <ChannelContainer>
          <LoadingIndicator />
        </ChannelContainer>
      }
    >
      <ChannelInner {...props} channelId={activeChannelId} key={`channel-${activeChannelId}`} />
    </QuerySuspenseContainer>
  );
};

export const Channel = memo(ChannelUnMemoized) as typeof ChannelUnMemoized;
