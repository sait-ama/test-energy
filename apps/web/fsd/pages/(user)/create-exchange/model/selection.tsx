import { createContext, ReactNode, useCallback, useMemo, useState } from 'react';

import { HeroCardItemSchema } from '~shared/api/models/inventory';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { ExchangeTypeSchema } from './store';

export type ShortItemSchema = {
  type: ExchangeTypeSchema;
  model: HeroCardItemSchema;
};

export type SeletionItemSchema = ShortItemSchema & {
  count: number;
};

type SelectionMapSchema = Map<string, SeletionItemSchema>;

type SelectionItemMeta = {
  canAdd: boolean;
  canRemove: boolean;
  count: number;
  countMax: number;
  id: string;
};

export const SelectionScopeStore = createContext<SelectionStoreSchema | null>(null);

type SelectionStoreSchema = {
  getItemMeta: (options: ShortItemSchema, scope?: string) => SelectionItemMeta;
  addItem: (options: ShortItemSchema, scope?: string) => void;
  removeItem: (options: ShortItemSchema, scope?: string) => void;
  isSelected: (options: ShortItemSchema, scope?: string) => boolean;
  value: Record<string, SeletionItemSchema[]>;
  _scopes: string[];
  resetSelection: () => void;
};

export const SelectionStore = createContext<SelectionStoreSchema | null>(null);

const exchangeIdSelector = (options: ShortItemSchema) => {
  const { type, model } = options;

  return `${type}-${model.id}`;
};

const getItemsCountMax = (options: ShortItemSchema) => {
  const { type, model } = options;

  if (type === 'card') return model.stack_count;

  return 1;
};

const _getSelectionItemMeta = ({
  type,
  model,
  selection,
}: ShortItemSchema & { selection: SelectionMapSchema }) => {
  const id = exchangeIdSelector({ type, model });
  const countMax = getItemsCountMax({ type, model });

  const item = selection.get(id);
  const count = item?.count || 0;

  const status: SelectionItemMeta = {
    canAdd: count < countMax,
    canRemove: count > 0,
    count,
    countMax,
    id,
  };

  return status;
};

const generateEmptySelection = (scopes: string[]) => {
  const scopedObj: Record<string, SelectionMapSchema> = {};

  scopes.forEach((scope) => (scopedObj[scope] = new Map()));

  return scopedObj;
};

export const SelectionStoreProvider = ({
  children,
  scopes = ['root'],
}: {
  children: ReactNode;
  scopes?: string[];
}) => {
  const [selection, setSelection] = useState<Record<string, SelectionMapSchema>>(() =>
    generateEmptySelection(scopes)
  );

  const defaultScope = useMemo(() => scopes[0]!, [scopes]);

  const getItemMeta = useCallback(
    (options: ShortItemSchema, scope: string = defaultScope) => {
      const scopedSelection = selection[scope]!;

      return _getSelectionItemMeta({ ...options, selection: scopedSelection });
    },
    [selection, defaultScope]
  );

  const addItem = ({ type, model }: ShortItemSchema, scope: string = defaultScope) =>
    setSelection((prev) => {
      const scopedSelection = prev[scope]!;

      const { canAdd, id, count } = _getSelectionItemMeta({
        type,
        model,
        selection: scopedSelection,
      });

      if (!canAdd) return prev;

      const newMap = new Map(scopedSelection);

      newMap.set(id, {
        type,
        model: model,
        count: count + 1,
      });

      return {
        ...prev,
        [scope]: newMap,
      };
    });

  const removeItem = ({ type, model }: ShortItemSchema, scope: string = 'root') =>
    setSelection((prev) => {
      const scopedSelection = prev[scope]!;

      const { canRemove, id, count } = _getSelectionItemMeta({
        type,
        model,
        selection: scopedSelection,
      });

      if (!canRemove) return prev;

      const newMap = new Map(scopedSelection);

      if (count === 1) {
        newMap.delete(id);
      } else {
        newMap.set(id, {
          type,
          model,
          count: count - 1,
        });
      }

      return {
        ...prev,
        [scope]: newMap,
      };
    });

  const resetSelection = () => {
    setSelection(generateEmptySelection(scopes));
  };

  const isSelected = useCallback(
    ({ type, model }: ShortItemSchema, scope: string = 'root') => {
      const id = exchangeIdSelector({ type, model });

      return selection[scope]!.has(id);
    },
    [selection]
  );

  const flattenSelection = useMemo(() => {
    const obj: Record<string, SeletionItemSchema[]> = {};

    for (const key in selection) {
      obj[key] = [...selection[key]!.values()];
    }

    return obj;
  }, [selection]);

  const context: SelectionStoreSchema = {
    addItem,
    removeItem,
    getItemMeta,
    isSelected,
    value: flattenSelection,
    _scopes: scopes,
    // _map: selection,
    resetSelection,
  };

  return <SelectionStore.Provider value={context}>{children}</SelectionStore.Provider>;
};

export const useSelection = () => useStrictContext(SelectionStore);

export type UseScopedSelectionReturn = Omit<
  Redefine<SelectionStoreSchema, { value: SelectionStoreSchema['value'][string] }>,
  '_scopes' | 'resetSelection'
>;
export const useScopedSelection = (scope: string): UseScopedSelectionReturn => {
  const selection = useSelection();

  const scopedSelection: UseScopedSelectionReturn = {
    addItem: useCallback(
      (options) => selection.addItem(options, scope),
      [selection.addItem, scope]
    ),
    removeItem: useCallback(
      (options) => selection.removeItem(options, scope),
      [selection.removeItem, scope]
    ),
    getItemMeta: useCallback(
      (options) => selection.getItemMeta(options, scope),
      [selection.getItemMeta, scope]
    ),
    isSelected: useCallback(
      (options) => selection.isSelected(options, scope),
      [selection.isSelected, scope]
    ),
    value: selection.value[scope]!,
  };

  if (!selection._scopes.includes(scope)) {
    throw new Error(`Wrong scope: ${scope}, expected ${selection._scopes}`);
  }

  return scopedSelection;
};
