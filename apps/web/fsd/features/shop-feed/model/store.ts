import { create, createStore } from 'zustand';

import { ShopItemSchema } from '~shared/api/models/shop';

export type ExcludeShopFragmentsState = {
  avatar: boolean;
  wallpaper: boolean;
  frame: boolean;
};

export type ExcludeShopFragmentsStore = ExcludeShopFragmentsState & {
  setEx: (val: Partial<ExcludeShopFragmentsState>) => void;
};

export const useExcludeShopFragmentsStore = create<ExcludeShopFragmentsStore>((set) => {
  return {
    avatar: true,
    wallpaper: true,
    frame: true,
    setEx: (val) => {
      set((v) => ({ ...v, ...val }));
    },
  };
});

export type ShopFeedItemPreviewState = {
  open: boolean;
  item: ShopItemSchema | null;
};

export type ShopFeedItemPreviewStateStore = ShopFeedItemPreviewState & {
  openPreivew: (item: ShopItemSchema | null) => void;
  setItem: (item: Partial<ShopItemSchema>) => void;
  closePreview: () => void;
};

export const createShopFeedItemPreviewStore = () => {
  return createStore<ShopFeedItemPreviewStateStore>((set) => {
    return {
      open: false,
      item: null,
      setItem: (item) => {
        if (item) {
          set((v) => ({ ...v, item: { ...(v.item as Required<ShopItemSchema>), ...item } }));
        }
      },
      openPreivew: (item) => {
        set((v) => ({ ...v, item, open: true }));
      },
      closePreview: () => {
        set((v) => ({ ...v, open: false, item: null }));
      },
    };
  });
};
