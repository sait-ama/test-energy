import { useParams } from 'next/navigation';

import { useCustomizations } from '~entities/inventory/model/queries';
import { FrameItem } from '~entities/inventory/ui/item/frame-item';
import { CustomizationItemType } from '~shared/api/models/inventory';
import { useSession } from '~shared/lib/session/use-session';
import { EmptyView } from '~shared/ui/empty-view';
import { FlatList } from '~shared/ui/flat-list-v2';
import { FrameItemWithModal } from '~widgets/inventory/ui/frame-item';

export const FramesTab = () => {
  const params = useParams<{ id: string }>();

  const { data, isFetching, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCustomizations({
      variables: {
        params: {
          userId: params.id,
        },
        query: {
          filter_by: CustomizationItemType.FRAME,
        },
      },
    });

  const frames = data?.pages?.flatMap((it) => it.results) || [];

  const session = useSession();
  const isCurrentUser = params.id === String(session?.id);

  const isEmpty = !isFetching && !frames.length;

  const handleSuccess = () => refetch();

  return (
    <EmptyView isEmpty={isEmpty} className="h-[40vh]">
      <FlatList.Root
        isLoading={isFetching}
        content={frames}
        className="cs-inventory-section xxs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        <FlatList.Content>
          {({ item: frame }) => (
            <FrameItemWithModal
              onSuccess={handleSuccess}
              key={frame.id}
              item={frame}
              isCurrentUser={isCurrentUser}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={10}>
          {({ key }) => <FrameItem isLoading key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={hasNextPage && !isFetchingNextPage}
        />
      </FlatList.Root>
    </EmptyView>
  );
};
