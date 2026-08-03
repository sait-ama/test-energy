import { useParams } from 'next/navigation';

import { useCustomizations } from '~entities/inventory/model/queries';
import { ThemeItem, ThemeItemWithModal } from '~entities/inventory/ui/item/theme-item';
import { CustomizationItemType } from '~shared/api/models/inventory';
import { useSession } from '~shared/lib/session/use-session';
import { EmptyView } from '~shared/ui/empty-view';
import { FlatList } from '~shared/ui/flat-list-v2';

export const ThemesTab = () => {
  const params = useParams<{ id: string }>();

  const { data, isFetching, refetch } = useCustomizations({
    variables: {
      params: {
        userId: params.id,
      },
      query: {
        filter_by: CustomizationItemType.THEME,
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
          {({ item: theme }) => {
            return <ThemeItemWithModal isCurrentUser key={theme.id} item={theme} />;
          }}
        </FlatList.Content>
        <FlatList.Loading count={10}>
          {({ key }) => <ThemeItem isLoading key={key} />}
        </FlatList.Loading>
      </FlatList.Root>
    </EmptyView>
  );
};
