'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

type TitlesFiltersStateContextProps = {
  filtersOpen?: boolean;
  onFiltersOpenChange?: (filtersOpen: boolean | undefined) => void;
};

type TitlesFiltersStateContextValue = {
  filtersOpen: boolean | undefined;
  setFiltersOpen: Dispatch<SetStateAction<boolean | undefined>>;
  filtersOpenUI: boolean | undefined;
  setFiltersOpenUI: Dispatch<SetStateAction<boolean | undefined>>;
};

export const { Provider: TitlesFiltersStateProvider, useStore: useTitlesFiltersState } =
  createContext<TitlesFiltersStateContextValue, undefined, TitlesFiltersStateContextProps>(
    (_, props) => {
      const { filtersOpen: filtersOpenProp, onFiltersOpenChange } = props ?? {};
      const [filtersOpen, setFiltersOpen] = useState<boolean | undefined>(filtersOpenProp);
      const [filtersOpenUI, setFiltersOpenUI] = useState<boolean | undefined>(filtersOpenProp);

      const isFirstRender1 = useRef(true);
      const isFirstRender2 = useRef(true);

      useEffect(() => {
        if (isFirstRender1.current) {
          isFirstRender1.current = false;
          return;
        }

        if (filtersOpenProp) {
          setFiltersOpen(filtersOpenProp);
        }
      }, [filtersOpenProp]);

      useEffect(() => {
        if (isFirstRender2.current) {
          isFirstRender2.current = false;
          return;
        }

        onFiltersOpenChange?.(filtersOpen);
      }, [filtersOpen]);

      return {
        filtersOpen,
        setFiltersOpen,
        filtersOpenUI,
        setFiltersOpenUI,
      };
    },
    'TitlesFiltersStateContext'
  );
