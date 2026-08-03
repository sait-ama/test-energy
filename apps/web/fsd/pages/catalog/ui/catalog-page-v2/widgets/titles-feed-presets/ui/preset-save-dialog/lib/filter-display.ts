import { type AnyFilterType, BaseFilterTypes } from '~shared/lib/filters';

/**
 * Утилиты для отображения значений фильтров в человекочитаемом виде
 */

export const getFilterDisplayName = (
  filterKey: string,
  schema: Record<string, AnyFilterType>
): string => {
  const filterSchema = schema[filterKey];
  return filterSchema?.label || filterKey;
};
type Range = { min: number | null; max: number | null };
const isRange = (
  value: unknown | unknown[] | { min: number | null; max: number | null }
): value is Range => {
  if (Array.isArray(value) || !value || typeof value !== 'object') return false;
  return 'min' in value && 'min' in value;
};
export const getFilterValueDisplay = <
  T extends unknown | unknown[] | { min: number | null; max: number | null },
>(
  value: T,
  filterSchema: AnyFilterType
): string | string[] => {
  if (!value || !filterSchema) return '';

  switch (filterSchema.type) {
    case BaseFilterTypes.MULTISELECT:
    case BaseFilterTypes.SELECT: {
      if (Array.isArray(value)) {
        return value.map((v) => {
          const option = filterSchema.options?.find((opt) => opt.value === v);
          return option?.label || String(v);
        });
      }
      const option = filterSchema.options?.find((opt) => opt.value === value);
      return option?.label || String(value);
    }

    case BaseFilterTypes.RANGE: {
      if (isRange(value)) {
        if (value.min && value.max) {
          return `${value.min} - ${value.max}`;
        }
        if (value.min) {
          return `≥ ${value.min}`;
        }
        if (value.max) {
          return `≤ ${value.max}`;
        }
      }
      return String(value);
    }

    case BaseFilterTypes.BOOLEAN: {
      return value ? 'Да' : 'Нет';
    }

    case BaseFilterTypes.INPUT:
    default: {
      return String(value);
    }
  }
};

export const canRemoveIndividualValue = (filterSchema: AnyFilterType): boolean => {
  return filterSchema.type === BaseFilterTypes.MULTISELECT;
};

export const getIndividualValues = <T extends unknown | unknown[]>(
  value: T,
  filterSchema: AnyFilterType
): Array<{ value: T; label: string }> => {
  if (!canRemoveIndividualValue(filterSchema) || !Array.isArray(value)) {
    return [];
  }

  return value.map((v) => {
    const option = filterSchema.options?.find((opt) => opt.value === v);
    return {
      value: v,
      label: option?.label || String(v),
    };
  });
};
