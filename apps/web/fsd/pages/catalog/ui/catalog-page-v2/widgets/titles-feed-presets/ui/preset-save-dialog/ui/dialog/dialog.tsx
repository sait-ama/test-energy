'use client';

import { memo } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@re/ui-kit/ui/dialog';

import { usePresetSaveDialog } from '../../model/context';
import { PresetSaveModalContent } from './content';

export const PresetSaveDialog = memo(() => {
  const { isOpen, closeDialog } = usePresetSaveDialog();

  const dialogProps = {
    open: isOpen,
    onOpenChange: (open: boolean) => !open && closeDialog(),
  };

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Сохранить пресет фильтров</DialogTitle>
        </DialogHeader>
        <PresetSaveModalContent />
      </DialogContent>
    </Dialog>
  );
});

PresetSaveDialog.displayName = 'PresetSaveDialog';
