'use client';

import { memo } from 'react';

import { Drawer, DrawerContent } from '~shared/ui/drawer';

import { usePresetManageDialog } from '../../model/context';
import { PresetManageModalContent } from './content';
import { PresetManageHeader } from './header';

export const PresetManageDialog = memo(() => {
  const { isOpen, closeDialog, dialogTitle } = usePresetManageDialog();

  const drawerProps = {
    open: isOpen,
    onOpenChange: (open: boolean) => !open && closeDialog(),
  };

  return (
    <Drawer {...drawerProps}>
      <DrawerContent>
        <PresetManageHeader className="px-4 pt-4 pb-4">
          <div className="line-clamp-1 text-lg font-semibold">{dialogTitle}</div>
        </PresetManageHeader>
        <div className="px-4 pb-4">
          <PresetManageModalContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
});

PresetManageDialog.displayName = 'PresetManageDialog';
