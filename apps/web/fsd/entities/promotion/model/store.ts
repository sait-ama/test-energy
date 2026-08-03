import { create } from 'zustand';

import { createZustandContext } from '@re/core/utils/create-zustand-context';

import type { Promotion } from '~shared/api/models/promotion';

export interface PromotionDetailDialogState {
  isOpen: boolean;
  promotion: Promotion | null;
  openDialog: (promotion: Promotion) => void;
  closeDialog: () => void;
}

const usePromotionDetailDialogStore = create<PromotionDetailDialogState>((set) => ({
  isOpen: false,
  promotion: null,
  openDialog: (promotion) => set({ isOpen: true, promotion }),
  closeDialog: () => set({ isOpen: false }),
}));

export const {
  Provider: PromotionDetailDialogProvider,
  useStore: usePromotionDetailDialog,
  useStoreApi: usePromotionDetailDialogStoreApi,
} = createZustandContext<PromotionDetailDialogState>(
  () => usePromotionDetailDialogStore,
  'PromotionDetailDialog'
);
