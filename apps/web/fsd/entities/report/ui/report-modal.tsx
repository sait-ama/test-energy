'use client';

import { memo, ReactNode } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { Slot } from '@re/ui-kit/ui/slot';

import { useOpen } from '~shared/hooks/use-open';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { useLogged } from '~shared/lib/session/use-logged';

import type { ReportProps } from './report';
import { Report } from './report';

export type ReportModalProps = {
  children: ReactNode | ((onOpen: () => void) => ReactNode);
  onOpenChange?: (open: boolean) => void;
} & ReportProps;

export const ReportModal = memo(({ children, onOpenChange, ...rest }: ReportModalProps) => {
  const [open, toggle] = useOpen();
  const isLogged = useLogged();
  const { open: openAuthModal } = useAuthModal();

  const openResolved = open && isLogged;

  const handleOpen = () => {
    if (isLogged) {
      toggle();
      onOpenChange?.(open);
      return;
    }
    openAuthModal();
  };

  return (
    <Dialog modal open={openResolved} onOpenChange={toggle}>
      {typeof children === 'function' ? (
        children(handleOpen)
      ) : (
        <Slot onClick={handleOpen}>{children}</Slot>
      )}

      <DialogContent className="sm:max-w-[400px]">
        <DialogTitle className="sr-only">Форма для отправки жалобы</DialogTitle>
        {open && <Report {...rest} onSuccess={toggle} />}
      </DialogContent>
    </Dialog>
  );
});
