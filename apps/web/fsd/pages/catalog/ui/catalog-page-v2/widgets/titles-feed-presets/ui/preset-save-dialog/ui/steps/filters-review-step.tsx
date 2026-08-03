'use client';

import { memo } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { usePresetSaveDialog } from '../../model/context';
import { FilterGroup } from '../filter-chips/filter-group';

export const FiltersReviewStep = memo(() => {
  const { editableFilters, nextStep, closeDialog } = usePresetSaveDialog();

  const hasFilters = Object.keys(editableFilters).length > 0;

  if (!hasFilters) {
    return (
      <div className="space-y-6">
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Нет активных фильтров для сохранения в пресет</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeDialog}>
            Закрыть
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-muted-foreground mt-1 text-sm">
          Проверьте и отредактируйте фильтры, которые будут сохранены в пресет
        </p>
      </div>

      <ScrollArea className="flex max-h-[400px] flex-col rounded-md border">
        <div className="flex flex-col py-2">
          {Object.entries(editableFilters).map(([filterKey, value]) => (
            <FilterGroup key={filterKey} filterKey={filterKey} value={value} />
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={closeDialog}>
          Отмена
        </Button>
        <Button onClick={nextStep}>Далее</Button>
      </div>
    </div>
  );
});

FiltersReviewStep.displayName = 'FiltersReviewStep';
