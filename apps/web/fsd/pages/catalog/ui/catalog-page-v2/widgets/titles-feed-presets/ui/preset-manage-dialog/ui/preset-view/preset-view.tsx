'use client';

import { memo, useEffect } from 'react';

import Edit from '@re/ui-kit/icons/edit';
import Trash2 from '@re/ui-kit/icons/trash';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { useTitleFiltersStore } from '../../../../../../features/title-filters/model/context';
import {
  getFilterDisplayName,
  getFilterValueDisplay,
} from '../../../preset-save-dialog/lib/filter-display';
import { usePresetManageDialog } from '../../model/context';

export const PresetView = memo(() => {
  const {
    selectedPreset,
    setMode,
    setDialogTitle,
    setBackButton,
    startEditing,
    duplicatePreset,
    deletePreset,
  } = usePresetManageDialog();

  const schema = useTitleFiltersStore((v) => v.schema);

  useEffect(() => {
    if (selectedPreset) {
      setDialogTitle(selectedPreset.name);
      setBackButton(true, () => setMode('list'));
    }
  }, [selectedPreset, setDialogTitle, setBackButton, setMode]);

  if (!selectedPreset) {
    return null;
  }

  const filtersEntries = Object.entries(selectedPreset.filters);

  return (
    <div className="flex h-full max-h-full flex-col gap-6 overflow-hidden">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startEditing(selectedPreset)}
            startIcon={<Edit className="size-4" />}
          >
            Редактировать
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => duplicatePreset(selectedPreset)}
            startIcon={<Copy className="size-4" />}
          >
            Дублировать
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => deletePreset(selectedPreset)}
            className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/30"
            startIcon={<Trash2 className="size-4" />}
          >
            Удалить
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex max-h-full min-h-0 flex-col overflow-hidden">
        {filtersEntries.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-muted-foreground">В этом пресете нет фильтров</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex max-h-[480px] flex-col">
            <div className="flex flex-col space-y-3">
              {filtersEntries.map(([filterKey, value]) => {
                const filterSchema = schema[filterKey as keyof typeof schema];
                if (!filterSchema) return null;

                const displayName = getFilterDisplayName(filterKey, schema);
                const displayValue = getFilterValueDisplay(value, filterSchema);

                return (
                  <div key={filterKey} className="bg-card rounded-xl p-3 pt-2 pb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <h5 className="text-muted-foreground text-xs font-medium">{displayName}</h5>
                    </div>

                    <div className="text-sm">
                      {Array.isArray(displayValue) ? (
                        <div className="flex flex-wrap gap-2">
                          {displayValue.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="font-medium">{displayValue}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
});

PresetView.displayName = 'PresetView';
