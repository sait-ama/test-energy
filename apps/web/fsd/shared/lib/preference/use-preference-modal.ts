'use client';

import { create } from 'zustand';

interface Options {}

export interface State {
  isOpen: boolean;
  open: (options?: Options) => void;
}

export const usePreferenceModal = create<State>((set) => ({
  isOpen: false,
  open: (options) => {
    set((prev) => ({ ...prev, ...options, isOpen: true }));
  },
  close: () => {
    set((prev) => ({ ...prev, isOpen: false }));
  },
}));
