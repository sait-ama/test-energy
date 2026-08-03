import { ItemWrapper, ListWrapper } from '~features/shop-feed/ui/shop-feed/shop-feed-components';
import * as ItemCard from '~shared/ui/item-card';

export default function FeedLoading() {
  return (
    <ListWrapper>
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <ItemWrapper key={i}>
            <ItemCard.Root variant="solid" className="w-full">
              <ItemCard.Content />
              <ItemCard.Footer>
                <div className="h-[16px]" />
              </ItemCard.Footer>
            </ItemCard.Root>
          </ItemWrapper>
        ))}
    </ListWrapper>
  );
}
