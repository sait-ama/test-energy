'use client';

import { createContext } from '@re/core/utils/create-context';

import type { TitleFiltersSchema } from '../../../features/title-filters/model/schema';

export type Screen = keyof TitleFiltersSchema | 'exclude_filters' | 'extended_filters' | 'root';

export type FilterSliderContextType = {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  goBack: () => void;
};

export const { Provider: FilterSliderProvider, useStore: useFilterSliderStore } = createContext<
  FilterSliderContextType,
  FilterSliderContextType
>((value) => value);
