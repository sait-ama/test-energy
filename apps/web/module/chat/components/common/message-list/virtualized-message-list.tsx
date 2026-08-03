import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { ComputeItemKey, Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { ChannelSchema } from 'module/chat/model/types';

import { cn } from '@re/ui-kit/utils/cn';

import { useSession } from '~shared/lib/session/use-session';

import { DEFAULT_NEXT_CHANNEL_PAGE_SIZE } from '../../../constants/limits';
import {
  ChannelActionContextValue,
  ChatMessage,
  useChannelActionContext,
  useChannelStateContext,
  VirtualizedMessageListContextProvider,
} from '../../../context';
import type { UnknownType } from '../../../types/types';
import { MessageProps } from './../message/types';
import { useMarkRead } from './hooks/use-mark-read';
import { useNewMessageNotification } from './hooks/use-new-message-notification';
import {
  useMessageSetKey,
  usePrependedMessagesCount,
  useScrollToBottomOnNewMessage,
  useShouldForceScrollToBottom,
} from './hooks';
import { getGroupStyles, GroupStyle, processMessages } from './utils';
import {
  calculateFirstItemIndex,
  calculateItemIndex,
  EmptyPlaceholder,
  Header,
  Item,
  makeItemsRenderedHandler,
  messageRenderer,
} from './virtualized-message-list-components';

type PropsDrilledToMessage = 'messageActions';

type VirtualizedMessageListPropsForContext =
  | PropsDrilledToMessage
  | 'loadingMore'
  | 'shouldGroupByUser';

/**
 * Context object provided to some Virtuoso props that are functions (components rendered by Virtuoso and other functions)
 */
export type VirtuosoContext = Pick<
  VirtualizedMessageListProps,
  VirtualizedMessageListPropsForContext
> & {
  /** Object mapping between the message ID and a string representing the position in the group of a sequence of messages posted by the same user. */
  messageGroupStyles: Record<string, GroupStyle>;
  /** Number of messages prepended before the first page of messages. This is needed to calculate the virtual position in the virtual list. */
  numItemsPrepended: number;
  /** The original message list enriched with date separators, omitted deleted messages or giphy previews. */
  processedMessages: ChatMessage[];
  /** Instance of VirtuosoHandle object providing the API to navigate in the virtualized list by various scroll actions. */
  virtuosoRef: RefObject<VirtuosoHandle | null>;
};

type VirtualizedMessageListWithContextProps = VirtualizedMessageListProps & {
  channel: ChannelSchema;
  hasMore: boolean;
  hasMoreNewer: boolean;
  jumpToLatestMessage: () => Promise<void>;
  loadingMore: boolean;
  loadingMoreNewer: boolean;
  read?: boolean;
};

function captureResizeObserverExceededError(e: ErrorEvent) {
  if (
    e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    e.message === 'ResizeObserver loop limit exceeded'
  ) {
    e.stopImmediatePropagation();
  }
}

function useCaptureResizeObserverExceededError() {
  useEffect(() => {
    window.addEventListener('error', captureResizeObserverExceededError);
    return () => {
      window.removeEventListener('error', captureResizeObserverExceededError);
    };
  }, []);
}

function fractionalItemSize(element: HTMLElement) {
  return element.getBoundingClientRect().height;
}

function findMessageIndex(messages: Array<{ uuid: string }>, uuid: string) {
  return messages.findIndex((message) => message.uuid === uuid);
}

function calculateInitialTopMostItemIndex(
  messages: Array<{ uuid: string }>,
  highlightedMessageUuid: string | undefined
) {
  if (highlightedMessageUuid) {
    const index = findMessageIndex(messages, highlightedMessageUuid);
    if (index !== -1) {
      return { align: 'center', index } as const;
    }
  }
  return messages.length - 1;
}

const VirtualizedMessageListWithContext = (props: VirtualizedMessageListWithContextProps) => {
  const {
    hasMoreNewer,
    highlightedMessageUuid,
    jumpToLatestMessage,
    loadingMore,
    loadMore,
    loadMoreNewer,
    maxTimeBetweenGroupedMessages = 1000 * 60,
    messageActions,
    messageLimit = DEFAULT_NEXT_CHANNEL_PAGE_SIZE,
    messages,
    scrollToLatestMessageOnFocus = false,
    shouldGroupByUser = true,
    enableDateSeparator = true,
    suppressAutoscroll,
    containerClassName,
  } = props;

  // Stops errors generated from react-virtuoso to bubble up
  // to Sentry or other tracking tools.
  useCaptureResizeObserverExceededError();
  const userId = useSession((state) => state?.id);

  const virtuoso = useRef<VirtuosoHandle>(null);

  const processedMessages = useMemo(() => {
    if (typeof messages === 'undefined') {
      return [];
    }

    if (!enableDateSeparator) {
      return messages;
    }

    return processMessages({
      enableDateSeparator,
      messages,
      userId,
    });
  }, [messages, enableDateSeparator, userId]);

  const messageGroupStyles = useMemo(
    () =>
      processedMessages.reduce<Record<string, GroupStyle>>((acc, message, i) => {
        const style = getGroupStyles(
          message,
          processedMessages[i - 1],
          processedMessages[i + 1],
          !shouldGroupByUser,
          maxTimeBetweenGroupedMessages
        );
        if (style) acc[message.uuid] = style;
        return acc;
      }, {}),
    [maxTimeBetweenGroupedMessages, processedMessages.length, shouldGroupByUser]
  );

  const {
    atBottom,
    isMessageListScrolledToBottom,
    newMessagesNotification,
    setIsMessageListScrolledToBottom,
    setNewMessagesNotification,
  } = useNewMessageNotification(processedMessages, userId, hasMoreNewer);

  useMarkRead({
    isMessageListScrolledToBottom,
    wasMarkedUnread: false,
    userId: userId!,
  });

  const scrollToBottom = useCallback(async () => {
    if (hasMoreNewer) {
      await jumpToLatestMessage();
      return;
    }

    if (virtuoso.current) {
      virtuoso.current.scrollToIndex(processedMessages.length - 1);
    }

    setNewMessagesNotification(false);

    if (hasMoreNewer) {
      await jumpToLatestMessage();
      return;
    }

    if (virtuoso.current) {
      virtuoso.current.scrollToIndex(processedMessages.length - 1);
    }

    setNewMessagesNotification(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    virtuoso,
    processedMessages,
    // processedMessages were incorrectly rebuilt with a new object identity at some point, hence the .length usage
    processedMessages.length,
    hasMoreNewer,
    jumpToLatestMessage,
  ]);

  useScrollToBottomOnNewMessage({
    messages,
    scrollToBottom,
    scrollToLatestMessageOnFocus,
  });

  const numItemsPrepended = usePrependedMessagesCount(processedMessages, enableDateSeparator);

  const { messageSetKey } = useMessageSetKey({ messages });

  const shouldForceScrollToBottom = useShouldForceScrollToBottom(processedMessages, userId);

  const handleItemsRendered = useMemo(
    () => makeItemsRenderedHandler([], processedMessages),
    [processedMessages]
  );

  const followOutput = (isAtBottom: boolean) => {
    if (hasMoreNewer || suppressAutoscroll) {
      return false;
    }

    if (shouldForceScrollToBottom()) {
      return isAtBottom ? 'smooth' : 'auto';
    }
    // a message from another user has been received - don't scroll to bottom unless already there
    return isAtBottom ? 'smooth' : false;
  };

  const computeItemKey = useCallback<ComputeItemKey<UnknownType, VirtuosoContext>>(
    (index, _, { numItemsPrepended, processedMessages }) => {
      const itemIndex = calculateItemIndex(index, numItemsPrepended);
      const message = processedMessages[itemIndex];

      if (!message?.uuid) {
        return `fallback-${index}`; // Provide a fallback key
      }

      return message.uuid;
    },
    []
  );

  const atBottomStateChange = (isAtBottom: boolean) => {
    atBottom.current = isAtBottom;
    setIsMessageListScrolledToBottom(isAtBottom);

    if (isAtBottom) {
      loadMoreNewer?.(messageLimit);
    }
  };

  const atTopStateChange = (isAtTop: boolean) => {
    if (isAtTop) {
      loadMore?.(messageLimit);
    }
  };

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    if (highlightedMessageUuid) {
      const index = findMessageIndex(processedMessages, highlightedMessageUuid);
      if (index !== -1) {
        scrollTimeout = setTimeout(() => {
          virtuoso.current?.scrollToIndex({ align: 'center', index });
        }, 0);
      }
    }
    return () => {
      clearTimeout(scrollTimeout);
    };
  }, [highlightedMessageUuid, processedMessages]);

  if (!processedMessages) return null;

  return (
    <VirtualizedMessageListContextProvider value={{ scrollToBottom }}>
      <div className={cn('h-full max-h-full w-full', containerClassName)}>
        <div className="size-full">
          <Virtuoso<ChatMessage, VirtuosoContext>
            alignToBottom
            // startReached={() => atTopStateChange(true)}
            // endReached={() => atBottomStateChange(false)}
            atBottomStateChange={atBottomStateChange}
            atBottomThreshold={100}
            atTopStateChange={atTopStateChange}
            atTopThreshold={100}
            overscan={200}
            skipAnimationFrameInResizeObserver
            components={{
              EmptyPlaceholder,
              Header,
              Item,
            }}
            computeItemKey={computeItemKey}
            context={{
              loadingMore,
              messageActions,
              messageGroupStyles,
              numItemsPrepended,
              processedMessages,
              shouldGroupByUser,
              virtuosoRef: virtuoso,
            }}
            firstItemIndex={calculateFirstItemIndex(numItemsPrepended)}
            followOutput={followOutput}
            increaseViewportBy={{ bottom: 200, top: 0 }}
            initialTopMostItemIndex={calculateInitialTopMostItemIndex(
              processedMessages,
              highlightedMessageUuid
            )}
            itemContent={messageRenderer}
            itemSize={fractionalItemSize}
            itemsRendered={handleItemsRendered}
            key={messageSetKey}
            ref={virtuoso}
            style={{ overflowX: 'hidden' }}
            totalCount={processedMessages.length}
          />
        </div>
        {/* {TypingIndicator && <TypingIndicator />} */}
      </div>
    </VirtualizedMessageListContextProvider>
  );
};

export type VirtualizedMessageListProps = Partial<Pick<MessageProps, PropsDrilledToMessage>> & {
  /** Whether or not to enable date separators */
  enableDateSeparator?: boolean;
  /** Whether or not the list has more items to load */
  hasMore?: boolean;
  /** Whether or not the list has newer items to load */
  hasMoreNewer?: boolean;
  /** The uuid of the message to highlight and center */
  highlightedMessageUuid?: string;
  /** Whether or not the list is currently loading more items */
  loadingMore?: boolean;
  /** Whether or not the list is currently loading newer items */
  loadingMoreNewer?: boolean;
  /** Function called when more messages are to be loaded, defaults to function stored i */
  loadMore?: ChannelActionContextValue['loadMore'] | (() => Promise<void>);
  /** Function called when new messages are to be loaded, defaults to function stored in */
  loadMoreNewer?: ChannelActionContextValue['loadMore'] | (() => Promise<void>);
  /** Maximum time in milliseconds that should occur between messages to still consider them grouped together */
  maxTimeBetweenGroupedMessages?: number;
  /** The limit to use when paginating messages */
  messageLimit?: number;
  /** Optional prop to override the messages available from [ChannelStateContext](https://getstream.io/chat/docs/sdk/react/contexts/channel_state_context/) */
  messages?: ChatMessage[];
  /** When `true`, the list will scroll to the latest message when the window regains focus */
  scrollToLatestMessageOnFocus?: boolean;
  /** If true, group messages belonging to the same user, otherwise show each message individually */
  shouldGroupByUser?: boolean;
  /** stops the list from autoscrolling when new messages are loaded */
  suppressAutoscroll?: boolean;
  containerClassName?: string;
};

export function VirtualizedMessageList(props: VirtualizedMessageListProps) {
  const { jumpToLatestMessage, loadMore, loadMoreNewer } =
    useChannelActionContext('VirtualizedMessageList');

  const {
    channel,
    hasMore,
    hasMoreNewer,
    highlightedMessageUuid,
    loadingMore,
    loadingMoreNewer,
    messages,
    read,
    suppressAutoscroll,
  } = useChannelStateContext('VirtualizedMessageList');

  return (
    <VirtualizedMessageListWithContext
      channel={channel}
      hasMore={!!hasMore}
      hasMoreNewer={!!hasMoreNewer}
      highlightedMessageUuid={highlightedMessageUuid}
      jumpToLatestMessage={jumpToLatestMessage}
      loadingMore={!!loadingMore}
      loadingMoreNewer={!!loadingMoreNewer}
      loadMore={loadMore}
      loadMoreNewer={loadMoreNewer}
      messages={messages}
      read={read}
      suppressAutoscroll={suppressAutoscroll}
      {...props}
    />
  );
}
