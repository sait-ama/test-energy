import { RefObject, useCallback, useMemo, useRef } from 'react';
import { ComputeItemKey, Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { useQueryClient } from '@tanstack/react-query';
import {
  getChannelListQueryKey,
  useChannelsListSuspenseQuery,
} from 'module/chat/model/toolkit/queries';
import { ChatRepository } from 'module/chat/model/toolkit/repository';

import { cn } from '@re/ui-kit/utils/cn';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

import { ChannelListContextProvider } from '../../../context/channel-list-context';
import { useChatContext } from '../../../context/chat-context';
import { useLastCallback } from '../../../hooks/use-last-callback';
import {
  ChannelSchema,
  RoomEventDiscriminator,
  UserEventDiscriminator,
} from '../../../model/types';
import { useRoomEvents, useUserEvents } from '../chat/hooks/use-chat-events';
import { ChannelPreview } from './../channel-preview';
import { EmptyStateIndicator } from './empty-state-indicator';
import { ChannelsListErrorState } from './error-state';
import { LoadingChannels } from './loading-channels';
import { findItemIndexById, reorder, updateItemByIndex } from './utils';

type ChannelListProps = {
  className?: string;
};

type VirtuosoContext = {
  virtuosoRef: RefObject<VirtuosoHandle | null>;
  processedChannels: ChannelSchema[];
};

// Внутренний компонент, который будет внутри Suspense
const ChannelListInner = (props: ChannelListProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const { activeChannelId, setActiveChannelId } = useChatContext();

  const variables = {};

  const { data: channels } = useChannelsListSuspenseQuery({ variables });

  const queryClient = useQueryClient();

  useRoomEvents(({ event }) => {
    const EventDiscriminatorsToPop = [
      RoomEventDiscriminator.MESSAGE,
      RoomEventDiscriminator.MEMBER_JOIN,
      RoomEventDiscriminator.MEMBER_LEAVE,
    ];

    if (EventDiscriminatorsToPop.includes(event.discriminator)) {
      queryClient.setQueryData(getChannelListQueryKey({}), (old: ChannelSchema[]) => {
        return reorder(old, findItemIndexById(old, event.room_id), 0, {
          last_update_dt: new Date().toISOString(),
          ...(activeChannelId === event.room_id
            ? {
                last_read_dt: new Date().toISOString(),
              }
            : {}),
        });
      });
    }

    if (event.discriminator === RoomEventDiscriminator.MARK_READ) {
      queryClient.setQueryData(getChannelListQueryKey({}), (old: ChannelSchema[]) => {
        return updateItemByIndex(old, findItemIndexById(old, event.room_id), {
          last_read_dt: new Date().toISOString(),
        });
      });
    }
  });

  useUserEvents(({ event }) => {
    if (event.discriminator === UserEventDiscriminator.JOIN) {
      ChatRepository.Channel.byId({
        params: {
          channelId: event.room_id,
        },
      })
        .then((newChannel) => {
          queryClient.setQueryData(getChannelListQueryKey({}), (old: ChannelSchema[]) => {
            return [newChannel, ...old];
          });
        })
        .catch(console.error);
    }
    if (event.discriminator === UserEventDiscriminator.LEAVE) {
      queryClient.setQueryData(getChannelListQueryKey({}), (old: ChannelSchema[]) => {
        return old.filter((channel) => channel.id !== event.room_id);
      });
    }
  });

  const processedChannels = useMemo(() => {
    if (!channels) return [];
    return channels;
  }, [channels]);

  const handleSetActiveChannel = useLastCallback((item: ChannelSchema) =>
    setActiveChannelId(item.id)
  );

  const renderChannel = useCallback(
    (index: number, item: ChannelSchema) => {
      if (!item) return <div style={{ height: '1px' }}></div>;

      const previewProps = {
        channel: item,
        onChannelSelect: handleSetActiveChannel,
        isActive: activeChannelId === item.id,
      };

      return (
        <div className="mx-4">
          <ChannelPreview {...previewProps} key={item.id} />
        </div>
      );
    },
    [activeChannelId, handleSetActiveChannel]
  );

  const computeItemKey = useCallback<ComputeItemKey<ChannelSchema, VirtuosoContext>>(
    (_index, item) => item?.id,
    []
  );

  function fractionalItemSize(element: HTMLElement) {
    return element.getBoundingClientRect().height;
  }

  return (
    <ChannelListContextProvider
      value={{
        channels: processedChannels,
        setChannels: () => {},
      }}
    >
      <Virtuoso<ChannelSchema, VirtuosoContext>
        style={{ overflowX: 'hidden' }}
        context={{ processedChannels, virtuosoRef }}
        ref={virtuosoRef}
        className={cn(props.className)}
        components={{
          EmptyPlaceholder: EmptyStateIndicator,
          Footer: () => <div className="h-2" />,
        }}
        data={processedChannels}
        itemContent={renderChannel}
        computeItemKey={computeItemKey}
        itemSize={fractionalItemSize}
      />
    </ChannelListContextProvider>
  );
};

const ChannelsList = (props: ChannelListProps) => {
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

export { ChannelsList };
