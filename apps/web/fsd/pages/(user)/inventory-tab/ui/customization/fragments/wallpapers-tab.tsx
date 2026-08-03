import { useParams } from 'next/navigation';

import { useCustomizations } from '~entities/inventory/model/queries';
import { WallpaperItem } from '~entities/inventory/ui/item/wallpaper-item';
import { CustomizationItemType } from '~shared/api/models/inventory';
import { useSession } from '~shared/lib/session/use-session';
import { FlatList } from '~shared/ui/flat-list-v2';
import { WallpaperItemWithModal } from '~widgets/inventory/ui/wallpaper-item';

export const WallpapersTab = () => {
  const params = useParams<{ id: string }>();

  const { data, isFetching, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCustomizations({
      variables: {
        params: {
          userId: params.id,
        },
        query: {
          filter_by: CustomizationItemType.WALLPAPER,
        },
      },
    });
  const wallpapers = data?.pages?.flatMap((it) => it.results) || [];

  const session = useSession();
  const isCurrentUser = params.id === String(session?.id);

  const handleSuccess = () => refetch();

  return (
    <FlatList.Root
      isLoading={isFetching}
      content={wallpapers}
      className="cs-inventory-section xxs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <FlatList.Content>
        {({ item: wallpaper }) => (
          <WallpaperItemWithModal
            onSuccess={handleSuccess}
            key={wallpaper.id}
            item={wallpaper}
            isCurrentUser={isCurrentUser}
          />
        )}
      </FlatList.Content>
      <FlatList.Loading count={10}>
        {({ key }) => <WallpaperItem isLoading key={key} />}
      </FlatList.Loading>
      <FlatList.EdgeTrigger
        onTrigger={fetchNextPage}
        canTrigger={hasNextPage && !isFetchingNextPage}
      />
      <FlatList.Empty className="col-span-full" />
    </FlatList.Root>
  );
};
