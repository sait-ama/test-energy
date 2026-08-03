import type { ComponentPropsWithoutRef } from 'react';

import DotsVertical from '@re/ui-kit/icons/dots-vertical';

interface ProfileActionsTriggerProps extends ComponentPropsWithoutRef<'svg'> {}

export const ProfileActionsTrigger = (props: ProfileActionsTriggerProps) => (
  <DotsVertical {...props} />
);
