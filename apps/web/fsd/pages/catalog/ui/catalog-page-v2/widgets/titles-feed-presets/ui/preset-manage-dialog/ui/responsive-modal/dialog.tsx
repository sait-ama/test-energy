'use client';

import { memo } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@re/ui-kit/ui/dialog';

import { usePresetManageDialog } from '../../model/context';
import { PresetManageModalContent } from './content';
import { PresetManageHeader } from './header';

export const PresetManageDialog = memo(() => {
  const { isOpen, closeDialog, dialogTitle } = usePresetManageDialog();

  const dialogProps = {
    open: isOpen,
    onOpenChange: (open: boolean) => !open && closeDialog(),
  };

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col p-0">
        <DialogHeader>
          <PresetManageHeader className="p-6 pb-0">
            <DialogTitle className="line-clamp-1 text-left">{dialogTitle}</DialogTitle>
          </PresetManageHeader>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          <PresetManageModalContent />
        </div>
      </DialogContent>
    </Dialog>
  );
});

PresetManageDialog.displayName = 'PresetManageDialog';
