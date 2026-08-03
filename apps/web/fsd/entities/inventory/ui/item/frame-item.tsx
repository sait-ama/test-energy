import CheckIcon from '@re/ui-kit/icons/active-check';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import type { UserAvatarProps } from '~entities/user/ui/user-avatar';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import * as InventoryItem from '~shared/ui/item-card';

export type FrameItemImageProps = Omit<UserAvatarProps, 'frameSrc' | 'alt'> & {
  imgSrc?: UserAvatarProps['frameSrc'];
  alt?: string;
  withAvatarFallback?: boolean;
};

export const FrameItemImage = ({
  className,
  imgSrc,
  size = 128,
  avatarSrc,
  alt = 'frame',
  withFrameMargin = false,
  imgClassName,
  withAvatarFallback = true,
  ...props
}: FrameItemImageProps) => (
  <UserAvatar
    withAvatarFallback={withAvatarFallback}
    style={{ borderWidth: 0 }}
    {...props}
    withFrameMargin={withFrameMargin}
    size={size}
    className={cn('overflow-visible', className)}
    imgClassName={cn('m-auto w-full', imgClassName)}
    frameSrc={imgSrc}
    avatarSrc={avatarSrc || ''}
    alt={alt}
  />
);

export interface FrameItemProps {
  imgSrc?: string;
  name?: string;
  avatarSrc?: string;
  isUsing?: boolean;
  withHover?: boolean;
  isLoading?: boolean;
}

export const FrameItem = (props: FrameItemProps) => {
  const { imgSrc, isUsing = false, avatarSrc, withHover, isLoading = false } = props;

  return (
    <InventoryItem.Root withHover={withHover}>
      <InventoryItem.Content className="px-2">
        <SkeletonSlot
          className="size-[164px] rounded-xs"
          show={isLoading}
          render={<FrameItemImage imgSrc={imgSrc} avatarSrc={avatarSrc} />}
        />
      </InventoryItem.Content>
      <InventoryItem.Footer>
        <InventoryItem.Label>Рамка</InventoryItem.Label>
        {isUsing ? <CheckIcon /> : null}
      </InventoryItem.Footer>
    </InventoryItem.Root>
  );
};
