'use client';

import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';

import { create } from 'zustand';

import type { HeroCardSchema } from '~shared/api/models/inventory';
import { tailSetStateAction } from '~shared/lib/react/tail-set-state-action';
import { CookieService } from '~shared/utils/cookie-service';
import { useStrictContext } from '~shared/utils/use-strict-context';

interface HeroCardPreviewModalStore {
  isOpen: boolean;
  currentCard: HeroCardSchema | null;
  isSingleCard: boolean;
  openModal: (card: HeroCardSchema, isSingleCard?: boolean) => void;
  closeModal: () => void;
  registerLegacyCard: (card: HeroCardSchema, isSingleCard?: boolean) => void;
}

export const useHeroCardPreviewModalStore = create<HeroCardPreviewModalStore>((set) => ({
  isOpen: false,
  currentCard: null,
  isSingleCard: false,
  openModal: (card, isSingleCard = false) => set({ isOpen: true, currentCard: card, isSingleCard }),
  closeModal: () => set({ isOpen: false }),
  // This function is used to register cards from legacy modal components
  registerLegacyCard: (card, isSingleCard = false) => set({ currentCard: card, isSingleCard }),
}));

type HeroCardControlsContextSchema = {
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: Dispatch<SetStateAction<boolean>>;
  isSoundEnabled: boolean;
  setIsSoundEnabled: Dispatch<SetStateAction<boolean>>;
  // boolean value => rewrite to value; null => keep current value;
} | null;

const HeroCardControlsContext = createContext<HeroCardControlsContextSchema>(null);

export interface HeroCardControlsGlobalProviderProps {
  children: ReactNode;
  defaultValues: {
    isAnimationEnabled: boolean;
    isSoundEnabled: boolean;
  };
}

export const HeroCardControlsGlobalProvider = ({
  children,
  defaultValues,
}: HeroCardControlsGlobalProviderProps) => {
  const [isAnimationEnabled, _setIsAnimationEnabled] = useState<boolean>(
    defaultValues.isAnimationEnabled
  );

  const setIsAnimationEnabled = tailSetStateAction(_setIsAnimationEnabled, (v) => {
    CookieService.set('hero-card-animation-enabled', v);
  });

  const [isSoundEnabled, _setIsSoundEnabled] = useState<boolean>(defaultValues.isSoundEnabled);

  const setIsSoundEnabled = tailSetStateAction(_setIsSoundEnabled, (v) => {
    CookieService.set('hero-card-sound-enabled', v);
  });

  const context: HeroCardControlsContextSchema = {
    isAnimationEnabled,
    setIsAnimationEnabled,
    isSoundEnabled,
    setIsSoundEnabled,
  };

  return (
    <HeroCardControlsContext.Provider value={context}>{children}</HeroCardControlsContext.Provider>
  );
};

export interface HeroCardControlsLocalProviderProps {
  children: ReactNode;
  defaultValues: {
    isAnimationEnabled: boolean;
    isSoundEnabled: boolean;
  };
}

export const HeroCardControlsLocalProvider = ({
  children,
  defaultValues,
}: HeroCardControlsLocalProviderProps) => {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState<boolean>(
    defaultValues?.isAnimationEnabled
  );

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(defaultValues?.isSoundEnabled);

  const context: HeroCardControlsContextSchema = {
    isAnimationEnabled,
    setIsAnimationEnabled,
    isSoundEnabled,
    setIsSoundEnabled,
  };

  return (
    <HeroCardControlsContext.Provider value={context}>{children}</HeroCardControlsContext.Provider>
  );
};

export const useHeroCardControlsStore = () => useStrictContext(HeroCardControlsContext);
