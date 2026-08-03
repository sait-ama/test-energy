'use client';

import { memo, useEffect } from 'react';

import Search from '@re/ui-kit/icons/search';
import { Button } from '@re/ui-kit/ui/button';
import { Input } from '@re/ui-kit/ui/input';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { usePresetManageDialog } from '../../model/context';
import { PresetListItem } from './preset-list-item';

export const PresetList = memo(() => {
  const {
    filteredPresets,
    selectedPreset,
    searchQuery,
    setSearchQuery,
    selectPreset,
    startEditing,
    duplicatePreset,
    deletePreset,
    closeDialog,
    setDialogTitle,
    setBackButton,
  } = usePresetManageDialog();

  const hasPresets = filteredPresets.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    setDialogTitle('Мои пресеты');
    setBackButton(false);
  }, []);

  if (!hasPresets && !isSearching) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-sm text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Search className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">Нет сохранённых пресетов</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Создайте первый пресет, сохранив текущие настройки фильтров
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="outline" onClick={closeDialog} className="w-full">
            Закрыть
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 max-sm:pb-8">
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Поиск пресетов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results */}
      {isSearching && !hasPresets && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Search className="mx-auto mb-3 h-8 w-8 opacity-50" />
            <p className="text-muted-foreground">По запросу "{searchQuery}" ничего не найдено</p>
          </div>
        </div>
      )}

      {hasPresets && (
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="flex max-h-[480px] flex-col">
            <div className="space-y-3">
              {filteredPresets.map((preset) => (
                <PresetListItem
                  key={preset.name}
                  preset={preset}
                  isSelected={selectedPreset?.name === preset.name}
                  onView={selectPreset}
                  onEdit={startEditing}
                  onDuplicate={duplicatePreset}
                  onDelete={deletePreset}
                />
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
});

PresetList.displayName = 'PresetList';
