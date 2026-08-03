import Image from 'next/image';

import * as InventoryItem from '~shared/ui/item-card';

export interface PromocodeItemProps {
  imgSrc?: string;
}

export const PromocodeItem = ({ imgSrc }: PromocodeItemProps) => (
  <InventoryItem.Root withHover>
    <InventoryItem.Content>
      <Image
        src={imgSrc || ''}
        alt="promocode"
        width={1920}
        height={1080}
        className="h-[60px] w-full rounded-sm object-cover"
      />
    </InventoryItem.Content>
    <InventoryItem.Footer>
      <InventoryItem.Label>Промокод</InventoryItem.Label>
    </InventoryItem.Footer>
  </InventoryItem.Root>
);
