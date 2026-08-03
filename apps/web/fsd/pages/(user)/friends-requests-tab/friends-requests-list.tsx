'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'next/navigation';

import { cn } from '@re/ui-kit/utils/cn';

import { getSuspenseFriendsRequestsPaginatedListQuery } from '~entities/friend/model/queries';
import {
  FriendRequestCard,
  FriendRequestChangeStatusMenu,
} from '~entities/friend/ui/friend-request-card';
import { ErrorView } from '~features/error-view';
import type { FriendRequestSchema } from '~shared/api/models/friend';
import { ContentSuspenseInfiniteQuery } from '~shared/lib/react-query/content-suspense-query';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

const FriendsRequests = ({ itemClassName }: { itemClassName?: string }) => {
  const FlatList: FlatListType<FriendRequestSchema[]> = _FlatList;
  const { id: userId } = useParams<{ id: string }>();

  return (
    <ContentSuspenseInfiniteQuery
      queryOptions={getSuspenseFriendsRequestsPaginatedListQuery({
        variables: {
          params: { userId },
          query: { count: 20, page: 1 },
        },
      })}
    >
      {({
        data: { pages = [] } = {},
        isFetchingNextPage,
        isLoading,
        fetchNextPage,
        hasNextPage,
      }) => (
        <FlatList.Root
          isLoading={isLoading || isFetchingNextPage}
          className="cs-friend-requests-section cs-section"
          content={pages.flatMap((page) => page.results)}
        >
          <FlatList.Layout
            layout="list"
            className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 lg:gap-4')}
          >
            <FlatList.Content>
              {({ item }) => (
                <FriendRequestCard
                  className={cn('bg-secondary', itemClassName)}
                  key={item.id}
                  model={item}
                >
                  <FriendRequestChangeStatusMenu model={item} />
                </FriendRequestCard>
              )}
            </FlatList.Content>
            <FlatList.EdgeTrigger canTrigger={hasNextPage} onTrigger={fetchNextPage} />
          </FlatList.Layout>
          <FlatList.Empty text="Список заявок пуст" emoji="ඞ" />
        </FlatList.Root>
      )}
    </ContentSuspenseInfiniteQuery>
  );
};
export const FriendsRequestsList = ({ itemClassName }: { itemClassName?: string }) => (
  <ErrorBoundary fallback={<ErrorView className="m-auto" />}>
    <FriendsRequests itemClassName={itemClassName} />
  </ErrorBoundary>
);
