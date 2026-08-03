import type { ReactNode } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { useIsItemDeleting, useIsItemUpdating } from '~features/activity/model/hooks';

const ActivityItemUpdatingContainer = ({ children }: { children: ReactNode }) => {
  const isDeleting = useIsItemDeleting();
  const className = isDeleting ? 'opacity-40' : undefined;

  return <Slot className={className}>{children}</Slot>;
};

const ActivityItemDeletingContainer = ({ children }: { children: ReactNode }) => {
  const isUpdating = useIsItemUpdating();
  const className = isUpdating ? 'opacity-40' : undefined;

  return <Slot className={className}>{children}</Slot>;
};

export const ActivityItemContainers = Object.assign(
  {},
  {
    Updating: ActivityItemUpdatingContainer,
    Deleting: ActivityItemDeletingContainer,
  }
);
