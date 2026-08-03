'use client';

import React from 'react';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

export const AppButton = (props: ButtonProps) => {
  const { children, className, ...rest } = props;

  const handleClick = () => {
    // yaMetrika.reachGoal(MetrikaGoals.Footer.appDownload);
  };

  return (
    <Button
      {...rest}
      onClick={handleClick}
      variant="ghost"
      className={cn('bg-muted flex gap-2', className)}
    >
      {children}
    </Button>
  );
};
