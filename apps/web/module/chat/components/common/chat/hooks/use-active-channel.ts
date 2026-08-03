import { DefaultError, UseQueryOptions } from '@tanstack/react-query';
import { useChatContext } from 'module/chat/context/chat-context';
import { useChannelByIdSuspenseQuery } from 'module/chat/model/toolkit/queries';
import { ChannelSchema } from 'module/chat/model/types';

export const useActiveChannel = (
  select?: (data: ChannelSchema) => ChannelSchema,
  options?: Partial<UseQueryOptions<ChannelSchema, DefaultError>>
) => {
  const { activeChannelId } = useChatContext();

  return useChannelByIdSuspenseQuery({
    variables: {
      params: {
        channelId: activeChannelId ?? undefined,
      },
    },
    options: {
      enabled: !!activeChannelId,
      select,
      ...options,
    },
  });
};
