import { useMemo } from 'react';

import type { ChannelStateContextValue } from '../../../../context/channel-state-context';

export const useCreateChannelStateContext = (
  value: ChannelStateContextValue & {
    skipMessageDataMemoization?: boolean;
  }
) => {
  const {
    channel,
    channelCapabilities,
    error,
    hasMore,
    hasMoreNewer,
    highlightedMessageUuid,
    loading,
    loadingMore,
    members,
    messages = [],
    read = false,
    skipMessageDataMemoization,
    suppressAutoscroll,
    multipleUploads,
    dragAndDropWindow,
  } = value;

  const channelId = channel.id;
  const membersLength = members?.filter((member) => !member.is_deleted).length ?? 0;

  const memoizedMessageData = skipMessageDataMemoization
    ? messages
    : messages.map(({ status }) => `${status}`).join();

  const channelStateContext: ChannelStateContextValue = useMemo(
    () => ({
      channel,
      channelCapabilities,
      error,
      hasMore,
      hasMoreNewer,
      highlightedMessageUuid,
      loading,
      loadingMore,
      members,
      messages,
      read,
      suppressAutoscroll,
      multipleUploads,
      dragAndDropWindow,
    }),
    [
      channel,
      channelId,
      error,
      hasMore,
      hasMoreNewer,
      highlightedMessageUuid,
      loading,
      loadingMore,
      membersLength,
      memoizedMessageData,
      skipMessageDataMemoization,
      multipleUploads,
      dragAndDropWindow,
      suppressAutoscroll,
    ]
  );

  return channelStateContext;
};
