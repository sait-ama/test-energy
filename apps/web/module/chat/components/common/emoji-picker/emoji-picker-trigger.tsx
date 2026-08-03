import React, { ComponentType } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { HoverCardTrigger } from '@re/ui-kit/ui/hover-card';

export const EmojiPickerTrigger = ({
  buttonClassName,
  //   @ts-ignore
  ButtonIconComponent = EmojiPickerTrigger,
}: {
  buttonClassName?: string;
  ButtonIconComponent?: ComponentType;
}) => {
  return (
    <HoverCardTrigger asChild>
      <Button variant="ghost" size="sm" circle className={buttonClassName}>
        <ButtonIconComponent />
      </Button>
    </HoverCardTrigger>
  );
};
