'use client';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { useCurrentUserFriendsPaginatedListQuery } from '~entities/friend/model/hooks';
import { HorizontalFriendCard } from '~entities/friend/ui/horizontal-friend-card';
import { ErrorView } from '~features/error-view';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

const Friends = () => {
  const {
    data: pages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCurrentUserFriendsPaginatedListQuery();
  const friends = pages?.pages.flatMap((page) => page.results) || [];
  const t = useTranslations('reusable.empty_states');
  const FlatList: FlatListType<typeof friends> = _FlatList;

  return (
    <FlatList.Root className="w-full" content={friends} isLoading={isLoading || isFetchingNextPage}>
      <FlatList.Layout className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <FlatList.Content>
          {({ item: friend }) => <HorizontalFriendCard key={friend.id} model={friend} />}
        </FlatList.Content>
        <FlatList.Loading count={10}>
          {({ key }) => <HorizontalFriendCard isLoading model={null} key={key} />}
        </FlatList.Loading>
        <FlatList.Empty
          className="col-span-full opacity-70"
          height="40vh"
          isEmpty
          text={t('empty')}
          emoji="ඞ"
        />
        <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={hasNextPage} />
      </FlatList.Layout>
    </FlatList.Root>
  );
};

export const FriendsList = () => (
  <QueryErrorResetBoundary>
    <ErrorBoundary fallback={<ErrorView />}>
      <Friends />
    </ErrorBoundary>
  </QueryErrorResetBoundary>
);
