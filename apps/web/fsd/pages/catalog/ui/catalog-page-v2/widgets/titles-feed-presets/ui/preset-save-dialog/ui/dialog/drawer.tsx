'use client';

import { memo } from 'react';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '~shared/ui/drawer';

import { usePresetSaveDialog } from '../../model/context';
import { PresetSaveModalContent } from './content';

export const PresetSaveDialog = memo(() => {
  const { isOpen, closeDialog } = usePresetSaveDialog();

  const drawerProps = {
    open: isOpen,
    onOpenChange: (open: boolean) => !open && closeDialog(),
  };

  return (
    <Drawer {...drawerProps}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Сохранить пресет фильтров</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <PresetSaveModalContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
});

PresetSaveDialog.displayName = 'PresetSaveDialog';
