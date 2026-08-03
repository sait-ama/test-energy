import type { ComponentPropsWithoutRef } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

import { useActivityBanMutation } from '~features/activity/model/mutations';
import { useLoggedCheck } from '~shared/lib/session/use-logged';

const BanButton = ({
  className,
  children,
  asChild = false,
}: {
  asChild?: boolean;
} & ComponentPropsWithoutRef<'button'>) => {
  const mutation = useActivityBanMutation();
  const loggedCheck = useLoggedCheck();

  const props = {
    disabled: mutation.isPending,
    onClick: loggedCheck(() => mutation.mutateAsync()),
  };

  if (asChild) {
    return <Slot {...props}>{children}</Slot>;
  }

  return (
    <Button variant="ghost" size="sm" className={cn('pr-2 pl-1', className)} {...props}>
      D
    </Button>
  );
};

export const ActivityStaffActions = Object.assign(
  {},
  {
    Ban: BanButton,
  }
);
