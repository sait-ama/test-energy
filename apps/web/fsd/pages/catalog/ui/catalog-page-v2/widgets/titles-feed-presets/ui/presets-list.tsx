'use client';

import { memo } from 'react';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { useTitlesFeedPresetsContext } from '../model/context';
import { PresetItem } from './preset-item';

export const TitlesFeedPresetsList = memo((props: { startItems?: React.ReactNode }) => {
  const { startItems = null } = props;
  const { presets, activePreset } = useTitlesFeedPresetsContext();

  return (
    <ScrollArea className="">
      <div className="flex flex-row gap-2">
        {startItems}
        {presets?.map((preset) => (
          <PresetItem
            key={preset.name}
            preset={preset}
            isActive={activePreset?.name === preset.name}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" hidden />
    </ScrollArea>
  );
});
TitlesFeedPresetsList.displayName = 'TitlesFeedPresetsList';
