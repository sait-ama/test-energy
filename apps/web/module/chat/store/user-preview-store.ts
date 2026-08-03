import { create } from 'zustand/index';

import { ChannelMemberSchema } from '../model/types';

export interface UserPreviewStore {
  isOpen: boolean;
  member: ChannelMemberSchema | null;
  openDialog: (member: ChannelMemberSchema) => void;
  closeDialog: () => void;
}

export const useUserPreviewStore = create<UserPreviewStore>((set) => ({
  isOpen: false,
  member: null,
  openDialog: (member) => set({ isOpen: true, member }),
  closeDialog: () => set({ isOpen: false }),
}));
