import { memo, useCallback, useDeferredValue } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

import { useChannelSearchContext } from '../../../context/channel-search-context';
import { useChatContext } from '../../../context/chat-context';
import { useGetOrCreateChatWithUserMutation } from '../../../model/toolkit/mutations';
import { useChannelsListSuspenseQuery } from '../../../model/toolkit/queries';
import { ChannelSchema } from '../../../model/types';
import { LoadingChannels } from '../channel-list/loading-channels';
import { ChannelPreview } from '../channel-preview';
import { TopPeers } from '../user';

type ChannelSearchResultsProps = {
  className?: string;
  onBack?: () => void;
};

// Внутренний компонент с логикой поиска
const ChannelSearchResultsInner = ({ className, onBack }: ChannelSearchResultsProps) => {
  const { searchQuery } = useChannelSearchContext();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { setActiveChannelId, activeChannelId } = useChatContext();

  const { data: channels } = useChannelsListSuspenseQuery({
    variables: {
      query: {
        query: deferredSearchQuery,
        queryBy: 'friends',
        count: 20,
        page: 1,
      },
    },
  });

  const handleSelectChannel = useCallback(
    (channel: ChannelSchema) => {
      setActiveChannelId(channel.id);
      onBack?.();
    },
    [setActiveChannelId, onBack]
  );

  if (!channels?.length) {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <div className="text-muted-foreground flex w-full items-center justify-center p-8">
          Чаты не найдены
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col overflow-y-auto px-4', className)}>
      {channels.map((channel) => (
        <ChannelPreview
          key={channel.id}
          channel={channel}
          isActive={activeChannelId === channel.id}
          onChannelSelect={handleSelectChannel}
        />
      ))}
    </div>
  );
};

const ChannelSearchResults = memo(({ className, onBack }: ChannelSearchResultsProps) => {
  const { searchQuery } = useChannelSearchContext();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isSearchQueryEmpty = deferredSearchQuery?.length < 2;

  const { setActiveChannelId } = useChatContext();

  const { mutate: createChat, isPending: isCreatingChat } = useGetOrCreateChatWithUserMutation({
    onSuccess: (data) => {
      setActiveChannelId(data.id);
      onBack?.();
    },
  });

  if (isSearchQueryEmpty) {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <div className={cn('flex flex-col px-4', isCreatingChat && 'opacity-70')}>
          <TopPeers onContactClick={(id: number) => createChat({ userId: id })} />
        </div>
      </div>
    );
  }

  return (
    <QuerySuspenseContainer
      fallback={<LoadingChannels />}
      fallbackRender={({ resetErrorBoundary }) => (
        <div className="text-destructive flex w-full items-center justify-center p-8">
          Ошибка при поиске чатов. <button onClick={resetErrorBoundary}>Попробовать снова</button>
        </div>
      )}
    >
      <ChannelSearchResultsInner className={className} onBack={onBack} />
    </QuerySuspenseContainer>
  );
});

ChannelSearchResults.displayName = 'ChannelSearchResults';
ChannelSearchResultsInner.displayName = 'ChannelSearchResultsInner';

export { ChannelSearchResults };
