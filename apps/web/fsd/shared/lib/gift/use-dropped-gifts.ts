'use client';

import { create } from 'zustand';

import type { GiftSchema } from '~shared/api/models/gift';
import type { RewardAction } from '~shared/lib/gift/announce-drop';

export interface State {
  gift: GiftSchema | null;
  show: boolean;
  action: RewardAction | null;
}

export interface Actions {
  setGift: (value: GiftSchema | null, action?: RewardAction) => void;
  setShow: (value: boolean) => void;
}

export const useDroppedGifts = create<State & Actions>((set) => ({
  gift: null,
  show: false,
  action: null,
  setGift: (gift, action) => {
    set((prev) => ({ ...prev, show: true, gift, action: action ?? null }));
  },
  setShow: (show) => {
    set((prev) => ({ ...prev, show }));
  },
}));
