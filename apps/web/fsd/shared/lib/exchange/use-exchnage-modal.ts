'use client';

import { create } from 'zustand';

interface Options {}

export interface State {
  isOpen: boolean;
  open: (options?: Options) => void;
  close: () => void;
}

export const useExchangeModal = create<State>((set) => ({
  isOpen: false,
  open: (options) => {
    set((prev) => ({ ...prev, ...options, isOpen: true }));
  },
  close: () => {
    set((prev) => ({ ...prev, isOpen: false }));
  },
}));
