import CheckIcon from '@re/ui-kit/icons/active-check';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';

import type { UserAvatarProps } from '~entities/user/ui/user-avatar';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import * as InventoryItem from '~shared/ui/item-card';

export type AvatarItemImageProps = UserAvatarProps;

export const AvatarItemImage = (props: AvatarItemImageProps) => <UserAvatar {...props} />;

export interface AvatarItemProps {
  imgSrc?: string;
  name?: string;
  isUsing?: boolean;
  withHover?: boolean;
  isLoading?: boolean;
}

export const AvatarItem = (props: AvatarItemProps) => {
  const { imgSrc, isUsing = false, withHover = false, isLoading } = props;

  return (
    <InventoryItem.Root withHover={withHover}>
      <InventoryItem.Content className="px-2">
        <SkeletonSlot
          className="size-32 rounded-xs"
          show={isLoading}
          render={<AvatarItemImage alt="Avatar" avatarSrc={imgSrc} size={128} className="w-full" />}
        />
      </InventoryItem.Content>
      <InventoryItem.Footer>
        <InventoryItem.Label>Аватар</InventoryItem.Label>
        {!isLoading && isUsing ? <CheckIcon /> : null}
      </InventoryItem.Footer>
    </InventoryItem.Root>
  );
};
