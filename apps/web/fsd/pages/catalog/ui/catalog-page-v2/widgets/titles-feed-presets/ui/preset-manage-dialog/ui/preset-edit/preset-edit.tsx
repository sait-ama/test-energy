'use client';

import { memo, useCallback, useEffect, useState } from 'react';

import Check from '@re/ui-kit/icons/check';
import { CloseIcon } from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { Input } from '@re/ui-kit/ui/input';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { useTitleFiltersStore } from '../../../../../../features/title-filters/model/context';
import type { Preset, TitleFiltersPreset } from '../../../../model/types';
import { usePresetManageDialog } from '../../model/context';
import { EditableFilterGroup } from './editable-filter-group';

export const PresetEdit = memo(() => {
  const {
    editingPreset,
    selectedPreset,
    setDialogTitle,
    setBackButton,
    setMode,
    savePreset,
    cancelEditing,
  } = usePresetManageDialog();

  const schema = useTitleFiltersStore((v) => v.schema);

  const [presetName, setPresetName] = useState(editingPreset?.name || '');
  const [editableFilters, setEditableFilters] = useState<TitleFiltersPreset>(
    editingPreset?.filters || {}
  );
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const title = selectedPreset ? 'Редактирование пресета' : 'Новый пресет';
    setDialogTitle(title);

    const backAction = selectedPreset ? () => setMode('view') : () => setMode('list');
    setBackButton(true, backAction);
  }, [selectedPreset, setDialogTitle, setBackButton, setMode]);

  const removeFilterValue = useCallback(
    (filterKey: string, value?: unknown) => {
      setEditableFilters((prev) => {
        const filterSchema = (schema as Record<string, { type: string }>)[filterKey];
        const currentValue = (prev as Record<string, unknown>)[filterKey];

        if (!filterSchema || currentValue === undefined) {
          return prev;
        }

        // Handle MULTISELECT filters - remove specific value
        if (filterSchema.type === 'MULTISELECT' && Array.isArray(currentValue)) {
          const filteredValues = currentValue.filter((v) => v !== value);

          if (filteredValues.length === 0) {
            const { [filterKey]: _removed, ...rest } = prev as Record<string, unknown>;
            return rest as TitleFiltersPreset;
          }

          return { ...prev, [filterKey]: filteredValues };
        }

        // For other filter types, remove the entire filter
        const { [filterKey]: _removed, ...rest } = prev as Record<string, unknown>;
        return rest as TitleFiltersPreset;
      });
    },
    [schema]
  );

  const clearFilter = useCallback((filterKey: string) => {
    setEditableFilters((prev) => {
      const { [filterKey]: _removed, ...rest } = prev as Record<string, unknown>;
      return rest as TitleFiltersPreset;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError('');

      const updatedPreset: Preset = {
        name: presetName.trim(),
        filters: editableFilters,
      };

      await savePreset(updatedPreset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  }, [presetName, editableFilters, savePreset, isSaving]);

  const hasFilters = Object.keys(editableFilters).length > 0;
  const canSave = presetName.trim().length >= 2 && hasFilters && !isSaving;

  if (!editingPreset) {
    return null;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Name Field */}
      <div className="">
        <div className="mb-2 space-y-2">
          <Input
            id="preset-name"
            placeholder="Введите название пресета"
            value={presetName}
            onChange={(e) => {
              setPresetName(e.target.value);
              if (error) setError('');
            }}
            className={`transition-colors ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            maxLength={30}
          />
          <div className="flex items-center justify-between pl-2">
            {error ? (
              <p className="text-destructive text-sm">{error}</p>
            ) : (
              <p className="text-muted-foreground ml-auto pr-2 text-xs">{presetName.length}/30</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!hasFilters ? (
          <div className="flex h-full items-center justify-center pb-6">
            <div className="max-w-sm text-center">
              <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <CloseIcon className="text-muted-foreground size-6" />
              </div>
              <h3 className="text-foreground mb-2 font-medium">Нет активных фильтров</h3>
              <p className="text-muted-foreground text-sm">
                Пресет должен содержать хотя бы один фильтр для сохранения
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex max-h-[480px] flex-col">
            <div className="space-y-4">
              {Object.entries(editableFilters).map(([filterKey, value]) => (
                <EditableFilterGroup
                  key={filterKey}
                  filterKey={filterKey}
                  value={value}
                  removeFilterValue={removeFilterValue}
                  clearFilter={clearFilter}
                />
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={cancelEditing} disabled={isSaving} className="flex-1">
          Отмена
        </Button>
        <Button onClick={handleSave} disabled={!canSave} className="flex-1">
          {isSaving ? (
            'Сохранение...'
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

PresetEdit.displayName = 'PresetEdit';
