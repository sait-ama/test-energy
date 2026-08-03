import { createZustandContext } from '@re/core/utils/create-zustand-context';

import type { FiltersContextHook } from './middlewares';
import { createFiltersStore, FiltersStore } from './store';
import type { FiltersProps, FilterTypeConstraint, InitialState } from './types';
import { createContextUseField } from './utils';

/**
 * Опции для создания контекста фильтров
 */
export interface FiltersContextOptions<TFilterTypes extends FilterTypeConstraint> {
  displayName?: string;
  hooks?: FiltersContextHook<TFilterTypes>[];
}

/**
 * Фабрика: Создает контекст для фильтров с заданной схемой
 */
export function createFiltersContext<TFilterTypes extends FilterTypeConstraint>(
  opts: string | FiltersContextOptions<TFilterTypes> = 'Filters'
) {
  const generated = createZustandContext<
    FiltersStore<TFilterTypes>,
    FiltersProps<TFilterTypes>,
    InitialState<TFilterTypes>
  >(
    // @ts-expect-error: проблема с типами из-за immer и вложенных генериков, посмотреть и в будущем мб исправить ?
    (initialState?: InitialState<TFilterTypes>, props: FiltersProps<TFilterTypes>) =>
      createFiltersStore(initialState, props),
    opts
  );

  const useFilterField = createContextUseField(generated.useStore);

  return {
    ...generated,
    useFilterField,
  };
}
