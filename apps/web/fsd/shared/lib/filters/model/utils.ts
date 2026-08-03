import { useCallback } from 'react';

import type { FiltersStore } from './store';
import type {
  AnyFilterType,
  BaseFilterType,
  FiltersSchema,
  FiltersState,
  FilterTypeConstraint,
  ParsedFiltersState,
} from './types';
import { BaseFilterTypes } from './types';

/**
 * Семантическое сравнение значений фильтров на основе типа фильтра
 * @param value1 - первое значение для сравнения
 * @param value2 - второе значение для сравнения
 * @param filterSchema - схема фильтра для определения способа сравнения
 * @returns true если значения семантически равны
 */
export function isFilterValuesEqual(
  value1: any,
  value2: any,
  filterSchema: AnyFilterType
): boolean {
  if (!value1 && !value2) return true;
  if (!value1 || !value2) return false;

  switch (filterSchema.type) {
    case BaseFilterTypes.MULTISELECT: {
      if (!Array.isArray(value1) || !Array.isArray(value2)) return false;
      if (value1.length !== value2.length) return false;

      const set1 = new Set(value1);
      const set2 = new Set(value2);

      // Если размеры Set отличаются от массивов, значит есть дубликаты
      if (set1.size !== value1.length || set2.size !== value2.length) {
        // Fallback к медленному сравнению если есть дубликаты
        const sorted1 = [...value1].sort();
        const sorted2 = [...value2].sort();
        return sorted1.every((item, index) => item === sorted2[index]);
      }

      // Быстрое сравнение через Set.has() - O(n)
      return value1.every((item) => set2.has(item));
    }

    case BaseFilterTypes.RANGE:
      if (typeof value1 !== 'object' || typeof value2 !== 'object') return false;
      if (Array.isArray(value1) || Array.isArray(value2)) return false;

      return value1.min === value2.min && value1.max === value2.max;

    case BaseFilterTypes.SELECT:
    case BaseFilterTypes.INPUT:
    case BaseFilterTypes.BOOLEAN:
    default:
      return value1 === value2;
  }
}

/**
 * Парсит URL search params в initialState для заданной схемы фильтров
 * @param searchParams - URL search params (строка, URL объект или URLSearchParams)
 * @param schema - схема фильтров
 * @returns initialState объект для передачи в Provider
 */
export function parseUrlToInitialState<TFilterTypes extends FilterTypeConstraint>(
  searchParams: string | URL | URLSearchParams,
  schema: FiltersSchema<TFilterTypes>
): ParsedFiltersState<TFilterTypes> {
  // Нормализуем searchParams к URLSearchParams
  let urlParams: URLSearchParams;

  if (typeof searchParams === 'string') {
    // Если строка начинается с '?', убираем его
    const cleanParams = searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
    urlParams = new URLSearchParams(cleanParams);
  } else if (searchParams instanceof URL) {
    urlParams = searchParams.searchParams;
  } else if (searchParams instanceof URLSearchParams) {
    urlParams = searchParams;
  } else {
    throw new Error('searchParams must be a string, URL, or URLSearchParams object');
  }

  const initialState: Partial<FiltersState<TFilterTypes>> = {};

  // Проходим по всем фильтрам в схеме
  Object.entries(schema).forEach(([key, filterConfig]) => {
    const typedFilterConfig = filterConfig as BaseFilterType;
    const urlValue = urlParams.get(key);

    if (urlValue !== null && typedFilterConfig.deserialize) {
      try {
        const deserializedValue = typedFilterConfig.deserialize(urlValue);

        // Добавляем в initialState только если удалось десериализовать
        initialState[key as keyof TFilterTypes] = {
          value: deserializedValue,
          isActive: true, // Если есть в URL, значит фильтр активен
        };
      } catch (error) {
        console.warn(`Failed to deserialize filter "${key}" from URL value "${urlValue}":`, error);
      }
    }
  });

  return initialState;
}

/**
 * Преобразует активные фильтры в URL параметры используя serialize методы из схемы
 * @param activeFilters - активные фильтры (из state.activeFilters или state.filters)
 * @param schema - схема фильтров
 * @returns объект параметров для URL (ключ-значение строки)
 */
export function serializeFiltersToParams<TFilterTypes extends FilterTypeConstraint>(
  activeFilters: Partial<FiltersState<TFilterTypes>>,
  schema: FiltersSchema<TFilterTypes>
): Record<string, string> {
  const params: Record<string, string> = {};

  // Проходим по всем активным фильтрам
  Object.entries(activeFilters).forEach(([key, filterState]) => {
    if (!filterState || !filterState.isActive) {
      return; // Пропускаем неактивные фильтры
    }

    const filterConfig = schema[key as keyof TFilterTypes] as AnyFilterType;
    const value = filterState.value;

    // Используем serialize метод если он есть
    if (filterConfig?.serialize && typeof filterConfig.serialize === 'function') {
      try {
        const serializedValue = filterConfig.serialize(value);
        if (serializedValue !== null && serializedValue !== undefined) {
          params[key] = serializedValue;
        }
      } catch (error) {
        console.warn(`Failed to serialize filter "${key}" with value:`, value, error);
      }
    } else {
      // Fallback к строковому представлению если serialize нет
      if (value !== null && value !== undefined) {
        params[key] = String(value);
      }
    }
  });

  return params;
}

/**
 * Преобразует параметры фильтров в URLSearchParams
 * @param activeFilters - активные фильтры
 * @param schema - схема фильтров
 * @returns готовый URLSearchParams объект
 */
export function serializeFiltersToSearchParams<TFilterTypes extends FilterTypeConstraint>(
  activeFilters: Partial<FiltersState<TFilterTypes>>,
  schema: FiltersSchema<TFilterTypes>
): URLSearchParams {
  const params = serializeFiltersToParams(activeFilters, schema);
  return new URLSearchParams(params);
}

/**
 * Преобразует параметры фильтров в query string
 * @param activeFilters - активные фильтры
 * @param schema - схема фильтров
 * @returns строка query параметров (без ведущего '?')
 */
export function serializeFiltersToQueryString<TFilterTypes extends FilterTypeConstraint>(
  activeFilters: Partial<FiltersState<TFilterTypes>>,
  schema: FiltersSchema<TFilterTypes>
): string {
  const searchParams = serializeFiltersToSearchParams(activeFilters, schema);
  return searchParams.toString();
}

/**
 * Преобразует активные фильтры в объект параметров для отправки на бэкенд
 * Использует serializeToRequest методы из схемы для кастомной сериализации
 * @param activeFilters - активные фильтры (из state.activeFilters или state.filters)
 * @param schema - схема фильтров
 * @returns объект параметров для отправки на API
 */
export function serializeFiltersToRequest<TFilterTypes extends FilterTypeConstraint>(
  activeFilters: Partial<FiltersState<TFilterTypes>>,
  schema: FiltersSchema<TFilterTypes>
): Record<string, any> {
  const requestParams: Record<string, any> = {};

  // Проходим по всем активным фильтрам
  Object.entries(activeFilters).forEach(([key, filterState]) => {
    if (!filterState || !filterState.isActive) {
      return; // Пропускаем неактивные фильтры
    }

    const filterConfig = schema[key as keyof TFilterTypes] as AnyFilterType;
    const value = filterState.value;

    // Используем serializeToRequest метод если он есть
    if (filterConfig?.serializeToRequest && typeof filterConfig.serializeToRequest === 'function') {
      try {
        const serializedParams = filterConfig.serializeToRequest(value, key);
        if (serializedParams && typeof serializedParams === 'object') {
          Object.assign(requestParams, serializedParams);
        }
      } catch (error) {
        console.warn(`Failed to serialize filter "${key}" to request with value:`, value, error);
      }
    } else {
      // Fallback к прямому присваиванию если serializeToRequest нет
      if (value !== null && value !== undefined) {
        requestParams[key] = value;
      }
    }
  });

  return requestParams;
}

/**
 * Создает стандартную функцию serializeToRequest для range фильтра
 * Преобразует { min, max } в { fieldName_gte: min, fieldName_lte: max }
 * @param gtePostfix - постфикс для минимального значения (по умолчанию '_gte')
 * @param ltePostfix - постфикс для максимального значения (по умолчанию '_lte')
 * @returns функция serializeToRequest для range фильтра
 */
export function createRangeRequestSerializer(
  gtePostfix: string = '_gte',
  ltePostfix: string = '_lte'
): (value: { min: number | null; max: number | null }, fieldName: string) => Record<string, any> {
  return (value, fieldName) => {
    const params: Record<string, any> = {};
    if (value.min !== null) {
      params[`${fieldName}${gtePostfix}`] = value.min;
    }
    if (value.max !== null) {
      params[`${fieldName}${ltePostfix}`] = value.max;
    }
    return params;
  };
}

/**
 * Создает функцию serializeToRequest для range фильтра с преобразованием значений
 * Полезно для преобразования дней в даты, чисел в строки и т.п.
 * @param transformer - функция преобразования значения перед отправкой
 * @param gtePostfix - постфикс для минимального значения (по умолчанию '_gte')
 * @param ltePostfix - постфикс для максимального значения (по умолчанию '_lte')
 * @returns функция serializeToRequest для range фильтра с преобразованием
 */
export function createRangeRequestSerializerWithTransform<T = any>(
  transformer: (value: number) => T,
  gtePostfix: string = '_gte',
  ltePostfix: string = '_lte'
): (value: { min: number | null; max: number | null }, fieldName: string) => Record<string, any> {
  return (value, fieldName) => {
    const params: Record<string, any> = {};
    if (value.min !== null) {
      params[`${fieldName}${gtePostfix}`] = transformer(value.min);
    }
    if (value.max !== null) {
      params[`${fieldName}${ltePostfix}`] = transformer(value.max);
    }
    return params;
  };
}

/**
 * Стандартная функция serializeToRequest для range фильтра
 * Преобразует { min, max } в { fieldName_gte: min, fieldName_lte: max }
 */
export const standardRangeRequestSerializer = createRangeRequestSerializer();

/**
 * Возвращаемый тип хука useFilterField
 */
export interface UseFilterFieldResult<TFilterType extends AnyFilterType> {
  /** Схема/конфигурация фильтра */
  schema: TFilterType;
  /** Текущее значение фильтра */
  value: any;
  /** Функция для изменения значения фильтра */
  onChange: (value: any) => void;
  /** Функция для сброса фильтра к дефолтному значению */
  onReset: () => void;
}

/**
 * Создает хук useFilterField для работы с отдельными полями фильтров
 */
export function createContextUseField<TFilterTypes extends FilterTypeConstraint>(
  useStore: <T>(selector: (state: FiltersStore<TFilterTypes>) => T) => T
) {
  /**
   * Хук для работы с отдельным полем фильтра
   * @param fieldName - ключ фильтра из схемы
   */
  function useFilterField<K extends keyof TFilterTypes>(
    fieldName: K
  ): UseFilterFieldResult<TFilterTypes[K]> {
    const schema = useStore((state) => state.schema[fieldName]);
    const value = useStore((state) => state.filters[fieldName].value);
    const setFilterValue = useStore((state) => state.setFilterValue);
    const resetFilter = useStore((state) => state.resetFilter);

    const onChange = useCallback(
      (newValue: any) => {
        setFilterValue(fieldName, newValue);
      },
      [setFilterValue, fieldName]
    );

    const onReset = useCallback(() => {
      resetFilter(fieldName);
    }, [resetFilter, fieldName]);

    return {
      schema,
      value,
      onChange,
      onReset,
    };
  }

  return useFilterField;
}
