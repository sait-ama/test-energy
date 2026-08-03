import { current } from 'immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';

import type {
  AnyFilterType,
  FiltersProps,
  FiltersSchema,
  FiltersState,
  FilterTypeConstraint,
  FilterValue,
  InitialFiltersState,
  InitialState,
} from './types';
import { serializeFiltersToParams } from './utils';

/**
 * Состояние стора фильтров
 */
export interface FiltersStoreState<TFilterTypes extends FilterTypeConstraint> {
  /** Текущие значения всех фильтров */
  filters: FiltersState<TFilterTypes>;
  /** Конфигурация фильтров */
  schema: FiltersSchema<TFilterTypes>;
  /** Производное состояние: есть ли активные фильтры */
  hasActiveFilters: boolean;
  /** Производное состояние: активные фильтры */
  activeFilters: Partial<FiltersState<TFilterTypes>>;
}

/**
 * Тип для результата сериализации фильтров
 * Содержит опциональные ключи из схемы фильтров со строковыми значениями
 */
export type SerializedFilters<TFilterTypes extends FilterTypeConstraint> = {
  [K in keyof TFilterTypes]?: string;
};

/**
 * Действия стора фильтров
 */
export interface FiltersStoreActions<TFilterTypes extends FilterTypeConstraint> {
  /** Установить значение конкретного фильтра */
  setFilterValue: <K extends keyof TFilterTypes>(
    key: K,
    value: FilterValue<TFilterTypes[K]>
  ) => void;

  /** Установить значения сразу нескольких фильтров */
  setFiltersValues: (
    filtersToUpdate: {
      [K in keyof TFilterTypes]?: FilterValue<TFilterTypes[K]>;
    },
    options?: { merge?: boolean }
  ) => void;

  /** Сбросить конкретный фильтр к значению по умолчанию */
  resetFilter: <K extends keyof TFilterTypes>(key: K) => void;

  /** Сбросить все фильтры к значениям по умолчанию */
  resetAllFilters: () => void;

  /** Сериализовать фильтры в параметры */
  serializeFilters: () => SerializedFilters<TFilterTypes>;

  /** Обновить схему фильтров */
  updateSchema: (newSchema: FiltersSchema<TFilterTypes>) => void;
}

/**
 * Полный интерфейс стора фильтров
 */
export interface FiltersStore<TFilterTypes extends FilterTypeConstraint>
  extends FiltersStoreState<TFilterTypes>,
    FiltersStoreActions<TFilterTypes> {}

/**
 * Получает дефолтное значение для фильтра
 */
function getDefaultValue<T extends AnyFilterType>(filterSchema: T): FilterValue<T> {
  if (filterSchema.defaultValue !== undefined) {
    return filterSchema.defaultValue as FilterValue<T>;
  }

  // Дефолтные значения по типу
  if (typeof filterSchema.deserialize === 'function') {
    try {
      return filterSchema.deserialize(null) as FilterValue<T>;
    } catch {
      return null as FilterValue<T>;
    }
  }

  return null as FilterValue<T>;
}

/**
 * Вычисляет активные фильтры из состояния фильтров
 */
function computeActiveFilters<TFilterTypes extends FilterTypeConstraint>(
  filters: FiltersState<TFilterTypes>
): Partial<FiltersState<TFilterTypes>> {
  const activeFilters: Partial<FiltersState<TFilterTypes>> = {};

  Object.entries(filters).forEach(([key, filterState]) => {
    if (
      filterState.isActive &&
      !!filterState.value &&
      filterState.value !== null &&
      !(Array.isArray(filterState.value) && filterState.value.length === 0)
    ) {
      activeFilters[key as keyof TFilterTypes] = filterState;
    }
  });

  return activeFilters;
}

/**
 * Проверяет есть ли активные фильтры
 */
function computeHasActiveFilters<TFilterTypes extends FilterTypeConstraint>(
  filters: Partial<FiltersState<TFilterTypes>>
): boolean {
  return Object.keys(filters).length > 0;
}

/**
 * Создает начальное состояние фильтров на основе конфигурации
 */
function createInitialFiltersState<TFilterTypes extends FilterTypeConstraint>(
  schema: FiltersSchema<TFilterTypes>,
  initialState?: InitialFiltersState<TFilterTypes>
): FiltersState<TFilterTypes> {
  const entries = Object.entries(schema).map(([key, filterSchema]) => {
    const typedFilterSchema = filterSchema as AnyFilterType;
    const defaultValue = getDefaultValue(typedFilterSchema);

    // Проверяем есть ли значение для этого фильтра в initialState
    const initialFilterState = initialState?.[key as keyof TFilterTypes];
    const hasInitialValue = initialFilterState !== undefined;

    // Используем либо переданное значение, либо дефолтное
    const value = hasInitialValue
      ? initialFilterState.value !== undefined
        ? initialFilterState.value
        : defaultValue
      : defaultValue;

    // const isActive = hasInitialValue || typedFilterSchema.isActive;
    const isActive = hasInitialValue
      ? initialFilterState.isActive || isFilterActive(typedFilterSchema, value)
      : typedFilterSchema.isActive;

    return [
      key,
      {
        value,
        isActive,
      },
    ];
  });

  return Object.fromEntries(entries) as FiltersState<TFilterTypes>;
}

/**
 * Проверяет, отличается ли значение от дефолтного
 */
function isFilterActive<T extends AnyFilterType>(filterSchema: T, value: FilterValue<T>): boolean {
  const defaultValue = getDefaultValue(filterSchema);
  return filterSchema.isActive || JSON.stringify(value) !== JSON.stringify(defaultValue);
}

/**
 * Фабрика для создания стора фильтров
 * мы используем any, потому что ts не поддерживает generics в store в связке с immer
 * Draft в ts выдает ошибки, но работает нормально
 */
export const createFiltersStore = <TFilterTypes extends FilterTypeConstraint>(
  initialState?: InitialState<TFilterTypes>,
  props?: FiltersProps<TFilterTypes>
) => {
  const schema = props?.schema;

  if (!schema) {
    throw new Error('FilterSchema is required');
  }

  // Извлекаем filters из initialState если они есть
  const initialFiltersState = createInitialFiltersState(schema, initialState?.filters);

  const activeFilters = computeActiveFilters(initialFiltersState);
  const hasActiveFilters = computeHasActiveFilters(activeFilters);

  return createStore<FiltersStore<TFilterTypes>>()(
    subscribeWithSelector(
      immer((set, get) => ({
        filters: initialFiltersState,
        schema,
        // Производные состояния
        activeFilters,
        hasActiveFilters,

        serializeFilters: () => serializeFiltersToParams(get().activeFilters, get().schema),

        setFilterValue: <K extends keyof TFilterTypes>(
          key: K,
          value: FilterValue<TFilterTypes[K]>
        ) => {
          set((state) => {
            const filterSchema = get().schema[key];
            state.filters[key].value = value;
            state.filters[key].isActive = isFilterActive(filterSchema, value);

            // Пересчитываем производные состояния на основе обновленного состояния
            const currentFilters = current(state.filters);
            const activeFilters = computeActiveFilters(currentFilters);
            state.hasActiveFilters = computeHasActiveFilters(activeFilters);
            state.activeFilters = activeFilters;
          });
        },

        setFiltersValues: (
          filtersToUpdate: {
            [K in keyof TFilterTypes]?: FilterValue<TFilterTypes[K]>;
          },
          options?: { merge?: boolean }
        ) => {
          set((state) => {
            const schema = get().schema;
            const shouldMerge = options?.merge !== false; // по умолчанию merge = true

            const currentFilters = shouldMerge ? createInitialFiltersState(schema) : state.filters;

            // Обновляем каждый переданный фильтр
            Object.entries(filtersToUpdate).forEach(([key, value]) => {
              const filterSchema = schema[key as keyof TFilterTypes];
              if (filterSchema && value !== undefined) {
                currentFilters[key].value = value;
                currentFilters[key].isActive = isFilterActive(filterSchema, value);
              }
            });

            state.filters = currentFilters;
            const activeFilters = computeActiveFilters(currentFilters);
            state.hasActiveFilters = computeHasActiveFilters(activeFilters);
            state.activeFilters = activeFilters;
          });
        },

        resetFilter: <K extends keyof TFilterTypes>(key: K) => {
          set((state) => {
            const filterSchema = get().schema[key];
            const defaultValue = getDefaultValue(filterSchema);
            state.filters[key].value = defaultValue;
            state.filters[key].isActive = false;

            // Пересчитываем производные состояния на основе обновленного состояния
            const currentFilters = current(state.filters);
            const activeFilters = computeActiveFilters(currentFilters);
            state.hasActiveFilters = computeHasActiveFilters(activeFilters);
            state.activeFilters = activeFilters;
          });
        },

        resetAllFilters: () => {
          set((state) => {
            const resetFiltersState = createInitialFiltersState(schema);
            state.filters = resetFiltersState;
            const activeFilters = computeActiveFilters(resetFiltersState);
            state.hasActiveFilters = computeHasActiveFilters(activeFilters);
            state.activeFilters = activeFilters;
          });
        },

        updateSchema: (newSchema: FiltersSchema<TFilterTypes>) => {
          set((state) => {
            const currentFilters = current(state.filters) as FiltersState<TFilterTypes>;

            state.schema = newSchema;

            const migratedFilters = Object.entries(newSchema).reduce((acc, [key, filterSchema]) => {
              const typedFilterSchema = filterSchema as AnyFilterType;
              const existingFilter = currentFilters[key as keyof TFilterTypes];

              // Если фильтр существовал, сохраняем его значение, иначе используем дефолт
              const value = existingFilter
                ? existingFilter.value
                : getDefaultValue(typedFilterSchema);
              const isActive = existingFilter ? existingFilter.isActive : false;

              acc[key as keyof TFilterTypes] = {
                value,
                isActive,
              };

              return acc;
            }, {} as FiltersState<TFilterTypes>);

            // Обновляем состояние
            state.filters = migratedFilters;

            // Пересчитываем производные состояния
            const activeFilters = computeActiveFilters(migratedFilters);
            state.hasActiveFilters = computeHasActiveFilters(activeFilters);
            state.activeFilters = activeFilters;
          });
        },
      }))
    )
  );
};
