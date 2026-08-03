import { ReactNode } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { UserSchemaFragment } from '~shared/api/models/common';
import { cn } from '~shared/utils/cn';

import { useUserSnapshotPreviewModalStore } from '../../model/stores';

// Trigger component using Zustand store
export type UserSnapshotPreviewModalTriggerProps = {
  model: UserSchemaFragment;
  children: ReactNode;
  isSingleCard?: boolean;
  asChild?: boolean;
  className?: string;
  footer?: ReactNode;
};

export const UserSnapshotPreviewModalTrigger = ({
  model,
  children,
  className,
  asChild = false,
  footer,
}: UserSnapshotPreviewModalTriggerProps) => {
  const openModal = useUserSnapshotPreviewModalStore((v) => v.openModal);

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp className={cn('cursor-pointer', className)} onClick={() => openModal(model, footer)}>
      {children}
    </Comp>
  );
};
