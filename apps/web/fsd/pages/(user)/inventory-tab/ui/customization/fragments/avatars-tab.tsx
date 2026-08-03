import { useParams } from 'next/navigation';

import { useCustomizations } from '~entities/inventory/model/queries';
import { AvatarItem } from '~entities/inventory/ui/item/avatar-item';
import { CustomizationItemType } from '~shared/api/models/inventory';
import { useSession } from '~shared/lib/session/use-session';
import { EmptyView } from '~shared/ui/empty-view';
import { FlatList } from '~shared/ui/flat-list-v2';
import { AvatarItemWithModal } from '~widgets/inventory/ui/avatar-item';

export const AvatarsTab = () => {
  const params = useParams<{ id: string }>();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useCustomizations({
      variables: {
        params: {
          userId: params.id,
        },
        query: {
          filter_by: CustomizationItemType.AVATAR,
        },
      },
    });

  const avatars = data?.pages?.flatMap((it) => it.results) || [];
  const session = useSession();
  const isCurrentUser = params.id === String(session?.id);

  const isEmpty = !isFetching && !avatars.length;

  const handleSuccess = () => refetch();

  return (
    <EmptyView isEmpty={isEmpty} className="h-[40vh]">
      <FlatList.Root
        isLoading={isFetching}
        content={avatars}
        className="cs-inventory-section xxs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        <FlatList.Content>
          {({ item: avatar }) => (
            <AvatarItemWithModal
              onSuccess={handleSuccess}
              key={avatar.id}
              item={avatar}
              isCurrentUser={isCurrentUser}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={10}>
          {({ key }) => <AvatarItem isLoading key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={hasNextPage && !isFetchingNextPage}
        />
      </FlatList.Root>
    </EmptyView>
  );
};
