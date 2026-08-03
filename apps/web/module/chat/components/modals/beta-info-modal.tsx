'use client';

import { useEffect, useState } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@re/ui-kit/ui/dialog';

import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';

export const BetaInfoModal = () => {
  // State to control modal visibility
  const [open, setOpen] = useState(false);

  // Use local storage to track if user has seen the modal
  const [hasSeenBetaModal, setHasSeenBetaModal] = useLocalStorageState<boolean>(
    'chat-beta-modal-seen',
    false
  );

  // Show modal on first visit
  useEffect(() => {
    if (!hasSeenBetaModal) {
      setOpen(true);
    }
  }, [hasSeenBetaModal]);

  // Handle confirmation button click
  const handleConfirm = () => {
    setHasSeenBetaModal(true);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        // Only allow closing from the confirmation button
        if (!value) {
          return;
        }
        setOpen(value);
      }}
    >
      <DialogContent withClose={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Бета-версия чата</DialogTitle>
          <DialogDescription>Добро пожаловать в бета-версию чата!</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground mb-3 text-sm">
            Обратите внимание, что эта функция находится на стадии тестирования.
          </p>
          <p className="text-muted-foreground mb-3 text-sm">
            Просим отнестись с пониманием к возможным техническим проблемам.
          </p>
          <p className="text-muted-foreground text-sm">
            <strong>Важно:</strong> Данные переписок в будущем могут быть удалены.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} fullWidth>
            Понятно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
