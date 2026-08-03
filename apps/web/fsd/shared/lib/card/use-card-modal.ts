'use client';

import { create } from 'zustand';

import type { HeroCardSchema } from '~shared/api/models/inventory';

export interface State {
  card: HeroCardSchema | null;
}

export interface Actions {
  setCard: (value: HeroCardSchema | null | undefined) => void;
}

export const useHeroCardModal = create<State & Actions>((set) => ({
  card: null,
  setCard: (card) => {
    set({ card });
  },
}));
