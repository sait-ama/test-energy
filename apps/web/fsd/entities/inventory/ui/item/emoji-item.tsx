import { PersonIcon } from '@re/ui-kit/icons/person';

import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';
import * as InventoryItem from '~shared/ui/item-card';

export interface EmojiItemProps {
  imgSrc?: string;
  name?: string;
  isUsing?: boolean;
}

const EmojiItemImage = ({ imgSrc }: { imgSrc: string }) => (
  <ImageRoot src={imgSrc} className="border-border aspect-square w-full rounded-sm border">
    <ImageContent
      unoptimized={(imgSrc ?? '').endsWith('.gif')}
      draggable={false}
      fill
      alt="emoji-pack"
      className="aspect-square w-full rounded-sm object-cover select-none"
    />
    <ImageFallback className="z-[2]">
      <PersonIcon size={140} />
    </ImageFallback>
  </ImageRoot>
);

export const EmojiItem = (props: EmojiItemProps) => {
  const { imgSrc, name } = props;

  return (
    <InventoryItem.Root withHover>
      <InventoryItem.Content>
        <EmojiItemImage imgSrc={imgSrc} />
      </InventoryItem.Content>
      <InventoryItem.Footer>
        <InventoryItem.Label>Эмодзи</InventoryItem.Label>
      </InventoryItem.Footer>
    </InventoryItem.Root>
  );
};
