import { Dispatch, memo, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import deepmerge from 'deepmerge';

import { createContext } from '@re/core/utils/create-context';

import { useHeroCardsByUserInfinite } from '~entities/inventory/model/queries';
import {
  MAX_EXCHANGEABLE_CARDS,
  MAX_FAVORITE_CARDS,
} from '~pages/(user)/inventory-tab/model/const';
import type { HeroCardOrdering, HeroCardSchema } from '~shared/api/models/inventory';
import { createSelectionContext } from '~shared/lib/selection/_internal/root';

import { HeroCardFiltersSchema } from '../types';
import { getHeroCardsFiltersFromSearchParams } from '../utils';

export interface State {
  isEditFavorite: boolean;
  isEditExchangeable: boolean;
  ordering: string;
  rank: string;
  favoriteCards: (HeroCardSchema & { fakeId: string })[];
  heroCards: (HeroCardSchema & { fakeId: string })[];
  heroCardsQuery: ReturnType<typeof useHeroCardsByUserInfinite>;
}

export interface Actions {
  setState: Dispatch<SetStateAction<Pick<State, 'isEditFavorite' | 'isEditExchangeable'>>>;
  setOrdering: Dispatch<SetStateAction<HeroCardOrdering>>;
  setRank: Dispatch<SetStateAction<string>>;
}

export const { Provider: HeroCardsActionsProvider, useStore: useHeroCardsActionStore } =
  createContext(() => {
    const [state, setState] = useState<Pick<State, 'isEditFavorite' | 'isEditExchangeable'>>({
      isEditFavorite: false,
      isEditExchangeable: false,
    });

    return {
      setState,
      ...state,
      isEdit: state.isEditFavorite || state.isEditExchangeable,
    };
  });

const { Provider: HeroCardsFiltersProvider, useStore: useHeroCardsFiltersStore } = createContext(
  () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [filters, _setFilters] = useState<HeroCardFiltersSchema>(() => {
      const filters = getHeroCardsFiltersFromSearchParams(searchParams);

      return filters;
    });

    const setFilter = useCallback((name: string, value: string | null) => {
      _setFilters((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          value,
        },
      }));
    }, []);

    const setFilters = useCallback((filters: Record<string, string | null>) => {
      const newFilters: Partial<HeroCardFiltersSchema> = {};

      Object.entries(filters).forEach(([filterName, filterSchema]) => {
        newFilters[filterName] = { value: filterSchema };
      });

      _setFilters((prev) => deepmerge(prev, newFilters));
    }, []);

    useEffect(() => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([filterName, filterSchema]) => {
        if (!filterSchema.value) return;
        searchParams.set(filterName, filterSchema.value);
      });

      window.history.replaceState(null, '', `${pathname}?${searchParams.toString()}`);
    }, [filters]);

    return {
      filters,
      setFilters,
      setFilter,
    };
  },
  'FiltersProvider'
);

export const { Provider: FavoriteSelectionProvider, useStore: useFavoriteSelection } =
  createSelectionContext();
export const { Provider: ExchangeableSelectionProvider, useStore: useExchangeableSelection } =
  createSelectionContext();

export const useSelection = () => {
  const { isEditFavorite, isEditExchangeable } = useHeroCardsActionStore();
  const favoriteSelection = useFavoriteSelection();
  const exchangeableSelection = useExchangeableSelection();

  if (isEditExchangeable) return exchangeableSelection;
  if (isEditFavorite) return favoriteSelection;

  return null;
};

interface SelectionRootProviderProps {
  children: ReactNode;
}

const FavoriteSelectionRootProvider = memo(({ children }: SelectionRootProviderProps) => {
  const { isEditFavorite } = useHeroCardsActionStore();

  return (
    <FavoriteSelectionProvider
      value={{
        enabled: isEditFavorite,
        idSelector: (v) => v.id,
        config: { length: MAX_FAVORITE_CARDS, storeIdArray: true },
      }}
    >
      {children}
    </FavoriteSelectionProvider>
  );
});

const ExchangeableSelectionRootProvider = memo(({ children }: SelectionRootProviderProps) => {
  const { isEditExchangeable } = useHeroCardsActionStore();

  return (
    <ExchangeableSelectionProvider
      value={{
        enabled: isEditExchangeable,
        idSelector: (v) => v.id,
        config: { length: MAX_EXCHANGEABLE_CARDS, storeIdArray: true },
      }}
    >
      {children}
    </ExchangeableSelectionProvider>
  );
});

interface HeroCardsRootProviderProps {
  children: ReactNode;
}

const HeroCardsRootProvider = memo(({ children }: HeroCardsRootProviderProps) => (
  <HeroCardsFiltersProvider>
    <HeroCardsActionsProvider>
      <FavoriteSelectionRootProvider>
        <ExchangeableSelectionRootProvider>{children}</ExchangeableSelectionRootProvider>
      </FavoriteSelectionRootProvider>
    </HeroCardsActionsProvider>
  </HeroCardsFiltersProvider>
));

export { HeroCardsRootProvider as HeroCardsProvider, useHeroCardsFiltersStore };
