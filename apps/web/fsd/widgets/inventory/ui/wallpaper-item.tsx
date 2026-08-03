'use client';

import { WallpaperItem, WallpaperItemImage } from '~entities/inventory/ui/item/wallpaper-item';
import { useOpen } from '~shared/hooks/use-open';
import { useLogged } from '~shared/lib/session/use-logged';
import { UrlFormatter } from '~shared/utils/url-formatter';

import type { CustomizationItemModalContentProps } from './customization-item-modal';
import { CustomizationItemModal } from './customization-item-modal';

export type WallpaperItemWithModalProps = Omit<CustomizationItemModalContentProps, 'imageSlot'>;

export const WallpaperItemWithModal = (props: WallpaperItemWithModalProps) => {
  const { item } = props;
  const [open, toggle, close] = useOpen();

  const isLogged = useLogged();
  const img = UrlFormatter.media(item.image_item.image.high);
  const content = (
    <WallpaperItem
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
          <WallpaperItemImage
            src={img}
            width={1920}
            height={1080}
            className="flex w-full"
            alt="wallpaper"
          />
        }
        className="max-w-lg"
      />
    </CustomizationItemModal.Root>
  );
};
