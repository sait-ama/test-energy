'use client';

import { AvatarItem, AvatarItemImage } from '~entities/inventory/ui/item/avatar-item';
import { useOpen } from '~shared/hooks/use-open';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { UrlFormatter } from '~shared/utils/url-formatter';

import type { CustomizationItemModalContentProps } from './customization-item-modal';
import { CustomizationItemModal } from './customization-item-modal';

export type AvatarItemWithModalProps = Omit<CustomizationItemModalContentProps, 'imageSlot'>;

export const AvatarItemWithModal = (props: AvatarItemWithModalProps) => {
  const { item } = props;

  const isLogged = useLogged();
  const session = useSession()!;
  const [open, toggle, close] = useOpen();

  const img = UrlFormatter.media(item.image_item.image.high) as string;

  const content = (
    <AvatarItem
      withHover={isLogged}
      imgSrc={img}
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
          <AvatarItemImage
            alt="Avatar"
            avatarSrc={img}
            frameSrc={session.frame.high}
            size={192}
            className="w-full"
          />
        }
        className="max-w-[400px]"
      />
    </CustomizationItemModal.Root>
  );
};
