import React from 'react';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { Slot } from '@re/ui-kit/ui/slot';

import type { InfoModalOptionsTypes } from '~shared/lib/info-modal/use-info-modal';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';

type InfoModalTriggerProps = {
  asChild?: boolean;
  options: InfoModalOptionsTypes;
} & ButtonProps;

export const InfoModalTrigger = (props: InfoModalTriggerProps) => {
  const { children, options, asChild, ...rest } = props;
  const open = useInfoModal((v) => v.open);
  const handleClick = () => {
    open(options);
  };

  if (asChild) {
    return <Slot onClick={handleClick}>{children}</Slot>;
  }

  return (
    <Button {...rest} onClick={handleClick}>
      {children}
    </Button>
  );
};
