'use client';

import { memo } from 'react';

import type { AnyFilterType } from '~shared/lib/filters';

import { useTitleFiltersStore } from '../../../../../../features/title-filters/model/context';
import {
  canRemoveIndividualValue,
  getFilterDisplayName,
  getFilterValueDisplay,
  getIndividualValues,
} from '../../lib/filter-display';
import { usePresetSaveDialog } from '../../model/context';
import { FilterChip } from './filter-chip';

interface FilterGroupProps {
  filterKey: string;
  value: any;
}

export const FilterGroup = memo<FilterGroupProps>(({ filterKey, value }) => {
  const schema = useTitleFiltersStore((v) => v.schema);
  const { removeFilterValue, clearFilter } = usePresetSaveDialog();

  const filterSchema = schema[filterKey as keyof typeof schema] as AnyFilterType;
  if (!filterSchema) return null;

  const displayName = getFilterDisplayName(filterKey, schema);
  const canRemoveIndividual = canRemoveIndividualValue(filterSchema);

  const itemClassName = 'not-last:border-b px-4 pt-2 pb-3 space-y-1';
  const titleClassName = 'ml-1 text-muted-foreground text-xs font-medium';

  const renderContent = () => {
    // Если можем удалять отдельные значения (multiselect)
    if (canRemoveIndividual) {
      const individualValues = getIndividualValues(value, filterSchema);

      if (individualValues.length === 0) return null;

      return (
        <>
          <div className="flex flex-wrap gap-2">
            {individualValues.map((item) => (
              <FilterChip
                key={`${filterKey}-${item.value}`}
                label={item.label}
                onRemove={() => removeFilterValue(filterKey, item.value)}
              />
            ))}
          </div>
        </>
      );
    }

    // Для остальных типов фильтров - один чип
    const displayValue = getFilterValueDisplay(value, filterSchema);
    const chipLabel = Array.isArray(displayValue) ? displayValue.join(', ') : displayValue;

    return <FilterChip label={chipLabel} onRemove={() => clearFilter(filterKey)} />;
  };

  return (
    <div className={itemClassName}>
      <div className={titleClassName}>{displayName}</div>
      {renderContent()}
    </div>
  );
});

FilterGroup.displayName = 'FilterGroup';
