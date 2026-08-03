import { createStore } from 'zustand';

import { ShopItemSchema } from '~shared/api/models/shop';

export type ShopFeedItemPreviewState = {
  open: boolean;
  item: ShopItemSchema | null;
};

export type ShopFeedItemPreviewStateStore = ShopFeedItemPreviewState & {
  openPreview: (item: ShopItemSchema | null) => void;
  closePreview: () => void;
  setItem: (item: Partial<ShopItemSchema>) => void;
};

export const createShopFeedItemPreviewStore = () => {
  return createStore<ShopFeedItemPreviewStateStore>((set) => {
    return {
      open: false,
      item: null,
      setItem: (item) => {
        set((store) => {
          if (store.item) {
            return { ...store, item: { ...store.item, ...item } };
          }
          return store;
        });
      },
      openPreview: (item) => {
        set((v) => ({ ...v, item, open: true }));
      },
      closePreview: () => {
        set((v) => ({ ...v, open: false, item: null }));
      },
    };
  });
};
