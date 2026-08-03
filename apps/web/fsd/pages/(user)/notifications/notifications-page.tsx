'use client';

import { useParams } from 'next/navigation';

import { useInfiniteNotificationsList } from '~entities/notification/model/queries';
import { useNotificationsStatus } from '~entities/notification/model/store';
import { NotificationCard } from '~pages/(user)/notifications/ui/notification-card';
import { NotificationWithSublist } from '~pages/(user)/notifications/ui/notification-with-sublist';
import type { NotificationSchema } from '~shared/api/models/notifications';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export const NotificationsPage = () => {
  const params = useParams();

  const { value } = useNotificationsStatus();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteNotificationsList({
      // @ts-ignore
      variables: { query: { status: value, type: params.dir } },
    });

  const FlatList: FlatListType<NotificationSchema[]> = _FlatList;

  const notifications = data?.pages.flatMap((it) => it.content) ?? [];

  return (
    <FlatList.Root
      isLoading={isLoading}
      content={notifications}
      isFetchingNextPage={isFetchingNextPage}
    >
      <FlatList.Layout className="flex flex-col gap-2">
        <FlatList.Content>
          {({ item }) =>
            item.total ? (
              <NotificationWithSublist key={item.id} model={item} />
            ) : (
              <NotificationCard key={item.id} model={item} />
            )
          }
        </FlatList.Content>
        <FlatList.Empty />
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={hasNextPage && !isFetchingNextPage}
        />
      </FlatList.Layout>
    </FlatList.Root>
  );
};
