'use client';

import { FrameItem, FrameItemImage } from '~entities/inventory/ui/item/frame-item';
import { useOpen } from '~shared/hooks/use-open';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';

import type { CustomizationItemModalContentProps } from './customization-item-modal';
import { CustomizationItemModal } from './customization-item-modal';

export type FrameItemWithModalProps = Omit<CustomizationItemModalContentProps, 'imageSlot'>;

export const FrameItemWithModal = (props: FrameItemWithModalProps) => {
  const { item } = props;

  const isLogged = useLogged();
  const session = useSession();
  const [open, toggle, close] = useOpen();

  const content = (
    <FrameItem
      withHover={isLogged}
      imgSrc={item.image_item.image.high}
      avatarSrc={session?.avatar.high}
      name={item.image_item.name}
      isUsing={item.is_using}
    />
  );

  if (!isLogged) return content;

  return (
    <CustomizationItemModal.Root open={open} onOpenChange={toggle}>
      <CustomizationItemModal.Trigger>{content}</CustomizationItemModal.Trigger>
      <CustomizationItemModal.Content
        {...props}
        onSuccess={close}
        imageSlot={
          <FrameItemImage
            size={192}
            imgSrc={item.image_item.image.high}
            avatarSrc={session?.avatar.high}
          />
        }
      />
    </CustomizationItemModal.Root>
  );
};
