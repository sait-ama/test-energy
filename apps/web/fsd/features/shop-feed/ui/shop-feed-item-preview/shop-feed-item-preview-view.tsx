import React from 'react';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';

import { isEmojiPack, ShopEmojiPack } from '~features/shop-feed/ui/shop-emoji-pack';
import { ShopItemThemeDetail } from '~features/shop-feed/ui/shop-feed-item-preview/shop-item-preview-theme';
import { useMediaQuery } from '~shared/hooks/use-media-query';
import { useOnReroute } from '~shared/hooks/use-on-reroute';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '~shared/ui/drawer';

import { useShopFeedItemPreview } from './model/context';
import { ShopItemImageItemDetail } from './shop-item-preview-image';

const ShopFeedItemPreviewViewContent = () => {
  const item = useShopFeedItemPreview((v) => v.item);

  if (!item) return null;
  return (
    <>
      {isEmojiPack(item) ? (
        <ShopEmojiPack shopItem={item} />
      ) : item.theme ? (
        <ShopItemThemeDetail shopItem={item} />
      ) : (
        <ShopItemImageItemDetail shopItem={item} />
      )}
    </>
  );
};

export const ShopFeedItemPreviewView = () => {
  const { open, closePreview } = useShopFeedItemPreview((v) => v);
  useOnReroute(closePreview);
  const isMobile = useMediaQuery('(max-width: 599.5px)');

  const handleOpenChange = () => {
    if (open) closePreview();
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent hideSwipeElement className="">
          <DrawerHeader>
            <DrawerTitle className="sr-only">Элемент кастомизации</DrawerTitle>
          </DrawerHeader>
          <div className="-mt-2 p-6 pt-0">
            <ShopFeedItemPreviewViewContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full !max-w-2xl">
        <DialogTitle className="sr-only">Элемент кастомизации</DialogTitle>
        <ShopFeedItemPreviewViewContent />
      </DialogContent>
    </Dialog>
  );
};
