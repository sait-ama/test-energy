'use client';

import { memo, PropsWithChildren } from 'react';

import SaveIcon from '@re/ui-kit/icons/save';
import { Button } from '@re/ui-kit/ui/button';

import { useCountActiveFilters } from '../../../features/title-filters/hooks/use-count-active-filters';
import { useTitlesFeedPresetsContext } from '../model/context';
import { usePresetSaveDialog } from './preset-save-dialog/model/context';

interface PresetSaveButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const PresetSaveButton = memo<PropsWithChildren<PresetSaveButtonProps>>(
  ({ variant = 'outline', size = 'sm', children = 'Сохранить пресет' }) => {
    const { openDialog } = usePresetSaveDialog();
    const { activePreset } = useTitlesFeedPresetsContext();
    const filtersCount = useCountActiveFilters();

    const isDisabled = filtersCount === 0 || !!activePreset;

    return (
      <Button
        variant={variant}
        size={size}
        onClick={openDialog}
        // color={isDisabled ? 'default' : 'primary'}
        className="gap-2"
        disabled={isDisabled}
      >
        <SaveIcon className="size-4 min-w-4" />
        {children}
      </Button>
    );
  }
);

PresetSaveButton.displayName = 'PresetSaveButton';
