'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'next/navigation';

import { useFriendsPaginatedListQuery } from '~entities/friend/model/queries';
import { VerticalFriendCard } from '~entities/friend/ui/vertical-friend-card';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { ErrorView } from '~features/error-view';
import type { FriendShipSchema } from '~shared/api/models/friend';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export const FriendsSlider = () => {
  const { id } = useParams();
  const { data: user } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const { data, isLoading } = useFriendsPaginatedListQuery(
    {
      variables: {
        params: { userId: id },
        query: { count: 20, page: 1 },
      },
    },
    { enabled: !!user!.count_friends }
  );

  if (!user!.count_friends) return null;

  const friends = data?.pages?.flatMap((v) => v.results).slice(0, 14);
  const FlatList: FlatListType<FriendShipSchema[]> = _FlatList;

  return (
    <ErrorBoundary fallback={<ErrorView className="m-auto" />}>
      <FlatList.Root isLoading={isLoading} content={friends}>
        <FlatList.Layout layout="grid">
          <FlatList.Content>
            {({ item }) => <VerticalFriendCard key={item.id} model={item} />}
          </FlatList.Content>
          <FlatList.Loading count={Math.min(Math.max(0, user!.count_friends), 20)}>
            {({ key }) => <VerticalFriendCard isLoading key={key} model={null} />}
          </FlatList.Loading>
          <FlatList.Empty height="100px" isEmpty={!isLoading} text="Пусто" emoji="💜" />
        </FlatList.Layout>
        {/*<Carousel*/}
        {/*    opts={{*/}
        {/*        align: 'start',*/}
        {/*        dragFree: true,*/}
        {/*    }}*/}
        {/*    className="w-full"*/}
        {/*>*/}
        {/*<CarouselContent className="mx-1.5 flex gap-2 md:mr-0">*/}

        {/*</CarouselContent>*/}
        {/*</Carousel>*/}
      </FlatList.Root>
    </ErrorBoundary>
  );
};
