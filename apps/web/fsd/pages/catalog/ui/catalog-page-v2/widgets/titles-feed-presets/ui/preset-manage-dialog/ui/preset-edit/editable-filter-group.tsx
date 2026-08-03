'use client';

import { memo } from 'react';

import CloseIcon from '@re/ui-kit/icons/close';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';

import type { AnyFilterType } from '~shared/lib/filters';

import { useTitleFiltersStore } from '../../../../../../features/title-filters/model/context';
import {
  canRemoveIndividualValue,
  getFilterDisplayName,
  getFilterValueDisplay,
  getIndividualValues,
} from '../../../preset-save-dialog/lib/filter-display';

interface EditableFilterGroupProps {
  filterKey: string;
  value: unknown;
  removeFilterValue: (filterKey: string, value?: unknown) => void;
  clearFilter: (filterKey: string) => void;
}

export const EditableFilterGroup = memo<EditableFilterGroupProps>(
  ({ filterKey, value, removeFilterValue, clearFilter }) => {
    const schema = useTitleFiltersStore((v) => v.schema);

    const filterSchema = schema[filterKey as keyof typeof schema] as AnyFilterType;
    if (!filterSchema) return null;

    const displayName = getFilterDisplayName(filterKey, schema);
    const canRemoveIndividual = canRemoveIndividualValue(filterSchema);

    // Если можем удалять отдельные значения (multiselect)
    if (canRemoveIndividual) {
      const individualValues = getIndividualValues(value, filterSchema);

      if (individualValues.length === 0) return null;

      return (
        <div className="bg-card relative rounded-xl p-3 pt-2 pb-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h5 className="text-muted-foreground text-xs font-medium">{displayName}</h5>
              <p className="text-muted-foreground text-xs">Нажмите на значение чтобы удалить его</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              circle
              onClick={() => clearFilter(filterKey)}
              className="text-muted-foreground hover:text-destructive absolute top-1 right-1 h-8 w-8 shrink-0 p-0"
            >
              <CloseIcon className="size-6" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {individualValues.map((item) => (
              <Badge
                key={`${filterKey}-${item.value}`}
                variant="outline"
                className="hover:bg-destructive/10 flexhover:text-destructive cursor-pointer items-center pr-1.5 text-sm transition-colors"
                onClick={() => removeFilterValue(filterKey, item.value)}
              >
                {item.label}
                <CloseIcon className="ml-1 size-4" />
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    // Для остальных типов фильтров - один блок
    const displayValue = getFilterValueDisplay(value, filterSchema);
    const chipLabel = Array.isArray(displayValue) ? displayValue.join(', ') : displayValue;

    return (
      <div className="bg-card relative rounded-xl p-3 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h5 className="text-muted-foreground truncate text-xs font-medium">{displayName}</h5>
            <span className="text-sm font-medium">{chipLabel}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter(filterKey)}
            className="text-muted-foreground hover:text-destructive absolute top-1 right-1 h-8 w-8 shrink-0 p-0"
          >
            <CloseIcon className="size-6" />
          </Button>
        </div>
      </div>
    );
  }
);

EditableFilterGroup.displayName = 'EditableFilterGroup';
