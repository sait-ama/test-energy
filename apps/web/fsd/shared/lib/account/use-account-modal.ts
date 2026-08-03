'use client';

import { create } from 'zustand';

export interface State {
  isOpen: boolean;
  openFreezed: boolean;
  open: () => void;
  close: () => void;
  freezeOpen: (isOpen?: boolean) => void;
  unfreezeOpen: (isOpen?: boolean) => void;
}

export const useAccountModal = create<State>((set) => ({
  isOpen: false,
  openFreezed: false,
  open: () => {
    set((prev) => (prev.openFreezed ? prev : { ...prev, isOpen: true }));
  },
  close: () => {
    set((prev) => (prev.openFreezed ? prev : { ...prev, isOpen: false }));
  },
  freezeOpen: (isOpen?: boolean) => {
    set((prev) => ({ ...prev, isOpen, openFreezed: true }));
  },
  unfreezeOpen: (isOpen?: boolean) => {
    set((prev) => ({ ...prev, isOpen, openFreezed: false }));
  },
}));
