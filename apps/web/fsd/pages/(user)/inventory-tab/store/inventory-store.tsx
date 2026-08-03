'use client';

import { Fragment } from 'react';

import { InventoryTab } from '../model/const';
import { HeroCardsProvider } from './hero-cards-store';

export const getProvider = (tab: string) => {
  switch (tab) {
    case InventoryTab.CARDS:
      return HeroCardsProvider;
    default:
      return Fragment;
  }
};
