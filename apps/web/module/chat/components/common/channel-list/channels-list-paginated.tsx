import { memo, useMemo, useRef } from 'react';

import { useChannelsPaginatedListSuspenseQuery } from 'module/chat/model/toolkit/queries';

import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

import { ChannelListContextProvider } from '../../../context/channel-list-context';
import { useChatContext } from '../../../context/chat-context';
import { useLastCallback } from '../../../hooks/use-last-callback';
import { ChannelSchema } from '../../../model/types';
import { ChannelPreview } from '../channel-preview';
import { ChannelPreviewPlaceholder } from '../channel-preview/channel-preview-placeholder';
import { LoadMorePaginator } from '../load-more/load-more-paginator';
import { EmptyStateIndicator } from './empty-state-indicator';
import { ChannelsListErrorState } from './error-state';
import { LoadingChannels } from './loading-channels';

type ChannelListProps = {
  className?: string;
};

// Внутренний компонент, который будет внутри Suspense
const ChannelListInner = (props: ChannelListProps) => {
  // @ts-expect-error
  const channelListRef = useRef<HTMLDivElement>();

  const { activeChannelId, setActiveChannelId } = useChatContext();

  const {
    data: channels,
    hasNextPage,
    loadNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
  } = useChannelsPaginatedListSuspenseQuery({
    variables: {
      query: {
        page: 1,
        count: 10,
      },
    },
  });

  // Получаем плоский массив каналов из бесконечной query
  const flatChannels = useMemo(() => {
    if (!channels) return [];
    return channels.pages.flatMap((page: any) => page.results) || [];
  }, [channels]);

  const handleSetActiveChannel = useLastCallback((item: ChannelSchema) =>
    setActiveChannelId(item.id)
  );

  const renderChannel = (item: ChannelSchema) => {
    const previewProps = {
      channel: item,
      onChannelSelect: handleSetActiveChannel,
      isActive: activeChannelId === item.id,
    };

    return <ChannelPreview {...previewProps} key={item.id} />;
  };

  // Определяем различные состояния UI
  const isEmpty = !isLoading && !isFetching && flatChannels && !flatChannels.length;

  const className = cn('px-4', props.className);

  return (
    <ChannelListContextProvider
      value={{
        channels: flatChannels,
        setChannels: () => {},
      }}
    >
      {isEmpty ? (
        <EmptyStateIndicator />
      ) : (
        <ScrollArea className={className} ref={channelListRef}>
          <LoadMorePaginator
            hasNextPage={hasNextPage}
            isLoading={isFetchingNextPage}
            loadNextPage={loadNextPage}
          >
            <div className="flex flex-col">
              {/* Список каналов */}
              {flatChannels.map((channel: ChannelSchema) => renderChannel(channel))}

              {/* Плейсхолдеры для дополнительно загружаемых каналов */}
              {isFetchingNextPage && (
                <div className="mt-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <ChannelPreviewPlaceholder key={`loading-more-${index}`} />
                  ))}
                </div>
              )}
            </div>
          </LoadMorePaginator>
        </ScrollArea>
      )}
    </ChannelListContextProvider>
  );
};

// Внешний компонент с QuerySuspenseContainer
const UnMemoizedChannelsList = (props: ChannelListProps) => {
  return (
    <QuerySuspenseContainer
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ChannelsListErrorState refetch={resetErrorBoundary} />
      )}
      fallback={<LoadingChannels />}
    >
      <ChannelListInner {...props} />
    </QuerySuspenseContainer>
  );
};

const ChannelsList = memo(UnMemoizedChannelsList) as typeof UnMemoizedChannelsList;

export { ChannelsList };
