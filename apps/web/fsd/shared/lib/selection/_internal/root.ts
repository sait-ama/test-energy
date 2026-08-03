'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useCallbackRef } from '~shared/hooks/use-callback-ref';

import { ALL_ALIAS } from './const';
import type { SelectionSchema } from './types';

export interface UseSelectionContext {
  selection: SelectionSchema;
  getItems: <T>(ids: NumberIsomorphic[]) => T[];
  selectAll: () => void;
  unselectAll: () => void;
  switchSelection: (id: NumberIsomorphic) => void;
  select: (id: NumberIsomorphic) => void;
  unselect: (id: NumberIsomorphic) => void;
  isSelected: (id: NumberIsomorphic) => boolean;
  resetSelection: () => void;
  changeAll: (ids: NumberIsomorphic[]) => void;
  getSelection: <T>() => SelectionSchema<T>;
  setData: Dispatch<SetStateAction<any[]>>;
  setDataFragments: Dispatch<SetStateAction<any[][]>>;
}

type IdSelector = (dataItem: any) => NumberIsomorphic;

interface SelectionProviderOptions {
  data?: any[];
  dataFragments?: any[][];
  enabled?: boolean;
  defaultSelection?: SelectionSchema;
  idSelector?: (dataItem: any) => NumberIsomorphic;
  config?: SelectionConfig;
}

interface SelectionConfig {
  length?: number;
  backendSelectAll?: boolean;
  storeIdArray?: boolean;
}

const getEmptySelection = () => ({ include: new Set(), exclude: new Set(), ids: [] });

//@ts-ignore
const defaultIdSelector = (v) => v.id;

// true if ok, false if failed
const validateSelection = (selection: SelectionSchema, config?: SelectionConfig) => {
  if (!config) return true;

  if (
    config.length != null &&
    (selection.include === ALL_ALIAS || selection.include.size > config.length)
  ) {
    return false;
  }

  return true;
};

const generateIndicesMap = (data: any[], idSelector: IdSelector) =>
  new Map(data.map((value, index) => [idSelector(value), index]));

const useCreateSelectionStore = (options: SelectionProviderOptions) => {
  const {
    data: _data = [],
    dataFragments: _dataFragments = [],
    idSelector = defaultIdSelector,
    defaultSelection,
    enabled = true,
    config: _config = {},
  } = options || {};

  const [data, setData] = useState(_data);
  const [dataFragments, setDataFragments] = useState(_dataFragments);

  const config: SelectionConfig = {
    backendSelectAll: false,
    storeIdArray: false,
    ..._config,
  };

  const memoizedIdSelector = useCallbackRef(idSelector);

  const indicesMap = useMemo(
    () => ({
      data: generateIndicesMap(data, memoizedIdSelector),
      dataFragments: dataFragments.map((data) => generateIndicesMap(data, memoizedIdSelector)),
    }),
    [data, dataFragments, memoizedIdSelector]
  );

  const [selection, _setSelection] = useState<SelectionSchema>(
    defaultSelection || getEmptySelection
  );
  const selectionRef = useRef(selection);

  const setSelection = (v: any) => {
    _setSelection((prev) => {
      const newValue = typeof v === 'function' ? v(prev) : v;

      selectionRef.current = newValue;
      return newValue;
    });
  };

  const isFirstRun = useRef(true);

  const selectAll: UseSelectionContext['selectAll'] = useCallback(() => {
    if (config.backendSelectAll) {
      setSelection({ include: ALL_ALIAS, exclude: new Set(), ids: [] });
      return;
    }

    const include = new Set();
    const exclude = new Set();
    const ids: NumberIsomorphic[] = [];

    const combinedData = [data, ...dataFragments].flat();

    for (const item of combinedData) {
      const id = memoizedIdSelector(item);

      if (config.storeIdArray && !include.has(id)) {
        ids.push(id);
      }

      include.add(id);
    }

    setSelection({ include, exclude, ids });
  }, [data, dataFragments, memoizedIdSelector]);

  const unselectAll: UseSelectionContext['unselectAll'] = useCallback(() => {
    setSelection(getEmptySelection());
  }, []);
  const resetSelection: UseSelectionContext['resetSelection'] = useCallback(() => {
    setSelection(defaultSelection || getEmptySelection());
  }, [defaultSelection]);

  const select: UseSelectionContext['select'] = useCallback((id) => {
    setSelection((prev: any) => {
      let newSelection: SelectionSchema;

      if (prev.include === ALL_ALIAS) {
        const exclude = new Set(prev.exclude);

        exclude.delete(id);

        newSelection = { ...prev, exclude };
      } else {
        const include = new Set(prev.include);
        const ids = include.has(id) || !config.storeIdArray ? prev.ids : [...prev.ids, id];

        include.add(id);

        newSelection = { ...prev, include, ids };
      }

      return validateSelection(newSelection, config) ? newSelection : prev;
    });
  }, []);

  const unselect: UseSelectionContext['unselect'] = useCallback((id) => {
    setSelection((prev: any) => {
      if (prev.include === ALL_ALIAS) {
        const exclude = new Set(prev.exclude);

        exclude.add(id);

        return { ...prev, exclude };
      } else {
        const include = new Set(prev.include);
        const ids = !config.storeIdArray ? prev.ids : prev.ids.filter((v) => v !== id);

        include.delete(id);

        return { ...prev, include, ids };
      }
    });
  }, []);

  const changeAll: UseSelectionContext['changeAll'] = useCallback((ids) => {
    setSelection({
      include: new Set(ids),
      exclude: new Set(),
      ids,
    });
  }, []);

  const switchSelection: UseSelectionContext['switchSelection'] = useCallback((id) => {
    setSelection((prev: any) => {
      let newSelection: SelectionSchema;

      if (prev.include === ALL_ALIAS) {
        const exclude = new Set(prev.exclude);

        if (exclude.has(id)) {
          exclude.delete(id);
        } else {
          exclude.add(id);
        }

        newSelection = { ...prev, exclude };
      } else {
        const include = new Set(prev.include);
        let ids: NumberIsomorphic[];

        if (include.has(id)) {
          ids = !config.storeIdArray ? prev.ids : prev.ids.filter((v) => v !== id);
          include.delete(id);
        } else {
          ids = !config.storeIdArray ? prev.ids : [...prev.ids, id];
          include.add(id);
        }

        newSelection = { ...prev, include, ids };
      }

      return validateSelection(newSelection, config) ? newSelection : prev;
    });
  }, []);

  const isSelected: UseSelectionContext['isSelected'] = useCallback(
    (id) =>
      selection.include === ALL_ALIAS ? !selection.exclude.has(id) : selection.include.has(id),
    [selection]
  );
  // const isSelected = (id) => (selection.include === ALL_ALIAS ? !selection.exclude.has(id) : selection.include.has(id));

  const getSelection: UseSelectionContext['getSelection'] = useCallback(
    () => selectionRef.current,
    []
  );

  const getItems: UseSelectionContext['getItems'] = useCallback(
    (ids) => {
      const combinedData = [data, ...dataFragments];
      const combinedMaps = [indicesMap.data, ...indicesMap.dataFragments];
      const result: any[] = [];
      for (const id of ids) {
        let foundItem = null;
        for (let i = 0; i < combinedMaps.length; i++) {
          const map = combinedMaps[i]!;
          const dataArray = combinedData[i]!;

          if (map.has(id)) {
            const index = map.get(id)!;
            foundItem = dataArray[index];
            break;
          }
        }
        if (foundItem !== null) {
          result.push(foundItem);
        }
      }
      return result;
    },
    [data, dataFragments, indicesMap]
  );

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    resetSelection();
  }, [enabled]);

  return {
    selection,
    getItems,
    selectAll,
    unselectAll,
    switchSelection,
    select,
    unselect,
    isSelected,
    resetSelection,
    changeAll,
    getSelection,
    setData,
    setDataFragments,
  };
};

export const createSelectionContext = () =>
  createContext<UseSelectionContext, SelectionProviderOptions>(useCreateSelectionStore);

export const { Provider: SelectionProvider, useStore: useSelection } = createSelectionContext();
