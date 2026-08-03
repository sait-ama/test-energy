'use client';

import React, { PropsWithChildren } from 'react';

import SettingsIcon from '@re/ui-kit/icons/settings';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';

import { useTitlesFeedPresetsContext } from '../model/context';
import { usePresetManageDialog } from './preset-manage-dialog/model/context';

interface PresetManageButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  renderButton?: ({
    openDialog,
    children,
  }: {
    openDialog: () => void;
    children?: React.ReactNode;
  }) => React.ReactNode;
  CustomComponent?: React.ReactElement<ButtonProps>;
}

export const PresetManageButton = ({
  variant = 'outline',
  size = 'sm',
  children = 'Управление пресетами',
  renderButton,
  CustomComponent,
}: PropsWithChildren<PresetManageButtonProps>): React.ReactNode => {
  const { openDialog } = usePresetManageDialog();
  const { customPresets } = useTitlesFeedPresetsContext();

  // Count custom presets (assuming they come first)
  const customPresetsCount = customPresets.length; // This will need refinement based on your structure

  if (renderButton) {
    return renderButton({ openDialog });
  }

  if (CustomComponent) {
    return React.cloneElement(CustomComponent, { onClick: openDialog });
  }

  return (
    <Button variant={variant} size={size} onClick={openDialog} className="gap-2">
      <SettingsIcon className="size-4 min-w-4" />
      {children}
      {customPresetsCount > 0 && (
        <span className="bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 text-xs">
          {customPresetsCount}
        </span>
      )}
    </Button>
  );
};
