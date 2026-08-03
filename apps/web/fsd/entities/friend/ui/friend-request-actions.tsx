import type { PropsWithChildren } from 'react';

import type { SlotProps } from '@radix-ui/react-slot';

import { Slot } from '@re/ui-kit/ui/slot';

export const FriendRequestActions = ({ children, ...other }: PropsWithChildren & SlotProps) => (
  <Slot {...other}>{children}</Slot>
);
