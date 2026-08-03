import { useParams } from 'next/navigation';

import { useCustomizations } from '~entities/inventory/model/queries';
import { CustomizationItemType } from '~shared/api/models/inventory';
import { EmptyView } from '~shared/ui/empty-view';
import { EmojiItemWithModal } from '~widgets/inventory/ui/emoji-item';

export const EmojiTab = () => {
  const params = useParams<{ id: string }>();

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useCustomizations({
    variables: {
      params: {
        userId: params.id,
      },
      query: {
        filter_by: CustomizationItemType.EMOJI,
      },
    },
  });

  const emoji = data?.pages?.flatMap((it) => it.results) || [];

  const isEmpty = !isFetching && !emoji.length;

  // todo: refactor to flat list
  return (
    <EmptyView isEmpty={isEmpty} className="h-[40vh]">
      <div className="cs-inventory-section xxs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {emoji.map((emoji) => (
          <EmojiItemWithModal key={emoji.id} item={emoji} />
        ))}
      </div>
    </EmptyView>
  );
};
