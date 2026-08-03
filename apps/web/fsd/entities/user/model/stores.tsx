import { ReactNode } from 'react';

import { create } from 'zustand';

import { UserSchemaFragment } from '~shared/api/models/common';

interface UserSnapshotModalStore {
  isOpen: boolean;
  model: UserSchemaFragment | null;
  openModal: (model: UserSchemaFragment, footer?: ReactNode | null) => void;
  closeModal: () => void;
  footer: ReactNode;
}

export const useUserSnapshotPreviewModalStore = create<UserSnapshotModalStore>((set) => ({
  isOpen: false,
  model: null,
  footer: null,
  openModal: (model, footer = null) => set({ isOpen: true, model, footer }),
  closeModal: () => set({ isOpen: false }),
}));
