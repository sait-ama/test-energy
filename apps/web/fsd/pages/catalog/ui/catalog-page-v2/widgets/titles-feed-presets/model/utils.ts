import { AnyFilterType, FiltersState, FilterValue, isFilterValuesEqual } from '~shared/lib/filters';

import { TitleFiltersSchema } from '../../../features/title-filters/model/schema';
import { Preset } from './types';

/**
 * Получает дефолтное значение для фильтра из схемы
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
 * Проверяет, являются ли переданные активные фильтры точным совпадением с пресетом
 * @param preset - пресет для сравнения
 * @param filters - текущее состояние всех фильтров
 * @param schema - схема фильтров
 * @returns true если активные фильтры точно соответствуют пресету
 */
export const isExactPreset = (
  preset: Preset,
  filters: FiltersState<TitleFiltersSchema>,
  schema: TitleFiltersSchema
): boolean => {
  // Проходим по всем фильтрам в схеме
  for (const filterKey in schema) {
    const typedFilterKey = filterKey as keyof TitleFiltersSchema;
    const filterSchema = schema[typedFilterKey];
    const currentFilterState = filters[typedFilterKey];
    const presetFilterValue = preset.filters[typedFilterKey];

    // Получаем дефолтное значение для фильтра
    const defaultValue = getDefaultValue(filterSchema);

    if (presetFilterValue !== undefined) {
      // Если фильтр есть в пресете, проверяем семантическое совпадение значений
      if (!isFilterValuesEqual(currentFilterState.value, presetFilterValue, filterSchema)) {
        return false;
      }
    } else {
      // Если фильтра нет в пресете, он должен иметь дефолтное значение
      if (!isFilterValuesEqual(currentFilterState.value, defaultValue, filterSchema)) {
        return false;
      }
    }
  }

  return true;
};
